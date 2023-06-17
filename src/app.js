const express = require('express');
const ProductManager = require('./ProductManager');
const path = require('path');
const fs = require('fs/promises');

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async addProduct(product) {
    const products = await this.getProductsFromDB();
    product.id = this.getNextProductId(products);
    products.push(product);
    await this.saveProductsToDB(products);
    return product.id;
  }

  async getProducts() {
    return await this.getProductsFromDB();
  }

  async getProductById(id) {
    const products = await this.getProductsFromDB();
    const productId = Number(id); // Convertir el id a número
    return products.find((product) => product.id === productId);
  }

  async updateProduct(id, updatedFields) {
    const products = await this.getProductsFromDB();
    const index = products.findIndex((product) => product.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      await this.saveProductsToDB(products);
      return true;
    }
    return false;
  }

  async deleteProduct(id) {
    const products = await this.getProductsFromDB();
    const index = products.findIndex((product) => product.id === id);
    if (index !== -1) {
      products.splice(index, 1);
      await this.saveProductsToDB(products);
      return true;
    }
    return false;
  }

  getNextProductId(products) {
    if (products.length === 0) {
      return 1;
    }
    const maxId = Math.max(...products.map((product) => product.id));
    return maxId + 1;
  }

  async getProductsFromDB() {
    try {
      const fileContents = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(fileContents);
    } catch (error) {
      throw new Error('Error al leer el archivo de productos');
    }
  }

  async saveProductsToDB(products) {
    try {
      await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    } catch (error) {
      throw new Error('Error al guardar los productos en el archivo');
    }
  }
}

const app = express();
const productManager = new ProductManager(path.join(__dirname, 'data/products.json'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/index.html'));
});

/* ENDPOINT PRODUCTOS */
app.get('/products', async (req, res) => {
  try {
    const limit = req.query.limit;
    const products = await productManager.getProducts();
    if (limit) {
      res.json(products.slice(0, limit));
    } else {
      res.json(products);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

/* ENDPOINT POR ID */
app.get('/products/:pid', async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await productManager.getProductById(productId);
    console.log('Product:', product);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

/* SERVIDOR 3000 */
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});