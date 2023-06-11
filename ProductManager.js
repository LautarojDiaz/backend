const fs = require('fs');

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  addProduct(product) {
    const products = this.getProductsFromDB();
    product.id = this.getNextProductId(products);
    products.push(product);
    this.saveProductsToDB(products);
    return product.id;
  }

  getProducts() {
    return this.getProductsFromDB();
  }

  getProductById(id) {
    const products = this.getProductsFromDB();
    return products.find((product) => product.id === id);
  }

  updateProduct(id, updatedFields) {
    const products = this.getProductsFromDB();
    const index = products.findIndex((product) => product.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      this.saveProductsToDB(products);
      return true;
    }
    return false;
  }

  deleteProduct(id) {
    const products = this.getProductsFromDB();
    const index = products.findIndex((product) => product.id === id);
    if (index !== -1) {
      products.splice(index, 1);
      this.saveProductsToDB(products);
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

  getProductsFromDB() {
    try {
      const fileContents = fs.readFileSync(this.path, 'utf-8');
      return JSON.parse(fileContents);
    } catch (error) {

      return [];
    }
  }

  saveProductsToDB(products) {
    fs.writeFileSync(this.path, JSON.stringify(products, null, 2));
  }
}

module.exports = ProductManager;


const productManager = new ProductManager('products.json');


const newProduct = {
  title: 'Producto 1',
  descripcion: 'Descripción del producto 1',
  price: 10.99,
  thumbnail: 'ruta/imagen1.jpg',
  code: 'ABC123',
  stock: 5,
};

const addedProduct = productManager.addProduct(newProduct);
console.log('Producto agregado:', addedProduct);

const allProducts = productManager.getProducts();
console.log('Todos los productos:', allProducts);

const productId = 1;
const productById = productManager.getProductById(productId);
console.log(`Producto con ID ${productId}:`, productById);


const productIdToUpdate = 1;
const updatedFields = {
  price: 12.99,
  stock: 10,
};
const updatedProduct = productManager.updateProduct(productIdToUpdate, updatedFields);
console.log('Producto actualizado:', updatedProduct);

const productIdToDelete = 1;
const isDeleted = productManager.deleteProduct(productIdToDelete);
console.log('Producto eliminado:', isDeleted);
