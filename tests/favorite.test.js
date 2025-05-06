const favoriteService = require('../src/services/favoriteService');
const db = require('../src/models');

jest.mock('../src/models');

describe('favoriteService.getUserFavorites', () => {
  const userId = 1;

  it('debería devolver una lista de productos favoritos del usuario', async () => {
    const mockFavorites = [
      {
        Producto: {
          id: 101,
          nombre: 'Producto 1',
          Vendedor: { user_id: 2, nombre: 'Vendedor A' },
          Categoria: { categoria_id: 10, nombre: 'Categoria X' }
        }
      },
      {
        Producto: {
          id: 102,
          nombre: 'Producto 2',
          Vendedor: { user_id: 3, nombre: 'Vendedor B' },
          Categoria: { categoria_id: 11, nombre: 'Categoria Y' }
        }
      }
    ];

    db.Favorite.findAll.mockResolvedValue(mockFavorites);

    const result = await favoriteService.getUserFavorites(userId);

    expect(db.Favorite.findAll).toHaveBeenCalledWith({
      where: { user_id: userId },
      include: [
        {
          model: db.Product,
          as: 'Producto',
          include: [
            {
              model: db.User,
              as: 'Vendedor',
              attributes: ['user_id', 'nombre']
            },
            {
              model: db.Category,
              as: 'Categoria',
              attributes: ['categoria_id', 'nombre']
            }
          ]
        }
      ]
    });

    expect(result).toEqual([mockFavorites[0].Producto, mockFavorites[1].Producto]);
  });

  it('debería lanzar un error si Sequelize falla', async () => {
    db.Favorite.findAll.mockRejectedValue(new Error('DB error'));

    await expect(favoriteService.getUserFavorites(userId))
      .rejects
      .toThrow('DB error');
  });
});

describe('favoriteService.addFavorite', () => {
  it('debería agregar un favorito si el producto existe', async () => {
    db.Product.findByPk.mockResolvedValue({ id: 1 });
    db.Favorite.findOrCreate.mockResolvedValue([{ user_id: 1, product_id: 2 }, true]);

    const result = await favoriteService.addFavorite(1, 2);
    expect(result.created).toBe(true);
    expect(db.Product.findByPk).toHaveBeenCalledWith(2);
    expect(db.Favorite.findOrCreate).toHaveBeenCalledWith({
      where: { user_id: 1, product_id: 2 }
    });
  });

  it('debería lanzar error si el producto no existe', async () => {
    db.Product.findByPk.mockResolvedValue(null);

    await expect(favoriteService.addFavorite(1, 999))
      .rejects
      .toThrow('Producto no encontrado');
  });
});

describe('favoriteService.removeFavorite', () => {
  it('debería eliminar un favorito existente', async () => {
    db.Favorite.destroy.mockResolvedValue(1);

    const result = await favoriteService.removeFavorite(1, 2);
    expect(result).toBe(true);
    expect(db.Favorite.destroy).toHaveBeenCalledWith({
      where: { user_id: 1, product_id: 2 }
    });
  });

  it('debería retornar false si no había favorito', async () => {
    db.Favorite.destroy.mockResolvedValue(0);

    const result = await favoriteService.removeFavorite(1, 2);
    expect(result).toBe(false);
  });
});

describe('favoriteService.isFavorite', () => {
  it('debería retornar true si el favorito existe', async () => {
    db.Favorite.findOne.mockResolvedValue({ user_id: 1, product_id: 2 });

    const result = await favoriteService.isFavorite(1, 2);
    expect(result).toBe(true);
  });

  it('debería retornar false si no existe', async () => {
    db.Favorite.findOne.mockResolvedValue(null);

    const result = await favoriteService.isFavorite(1, 2);
    expect(result).toBe(false);
  });
});

describe('favoriteService.clearFavorites', () => {
  it('debería eliminar todos los favoritos del usuario', async () => {
    db.Favorite.destroy.mockResolvedValue(3);

    await expect(favoriteService.clearFavorites(1)).resolves.toBeUndefined();
    expect(db.Favorite.destroy).toHaveBeenCalledWith({
      where: { user_id: 1 }
    });
  });

  it('debería manejar errores de Sequelize', async () => {
    db.Favorite.destroy.mockRejectedValue(new Error('DB error'));

    await expect(favoriteService.clearFavorites(1))
      .rejects
      .toThrow('DB error');
  });
});
