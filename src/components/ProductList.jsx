import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { UpdateProduct, AddProduct } from "../redux/ProductSlice";
import generateRandomId from "../utils/generateRandomId";
import { updateInvoiceProduct } from "../redux/invoicesSlice";

const ProductList = ({ onClose, onAddToInvoice }) => {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.products);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    ItemId: "",
    ItemName: "",
    ItemPrice: 0,
    ItemDescription: "",
  });

  const handleEditProduct = (productId) => {
    const productToEdit = productList.find((product) => product.ItemId === productId);
    setEditedProduct(productToEdit);
    setShowEditModal(true);
  };

  const handleSaveEditedProduct = () => {
    dispatch(UpdateProduct({ productID: editedProduct.ItemId, newproduct: editedProduct }));
    dispatch(updateInvoiceProduct({productId: editedProduct.ItemId,newproduct: editedProduct}));
    setShowEditModal(false);
    // After saving, reset the editedProduct state to clear the form fields
    setEditedProduct({
      ItemId: "",
      ItemName: "",
      ItemPrice: 0,
      ItemDescription: "",
    });
  };
  

  const handleAddProduct = () => {
    const newProduct = { ItemId: generateRandomId(), ItemName: "", ItemPrice: 0, ItemDescription: "" };
    dispatch(AddProduct(newProduct));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleAddToInvoiceClick = (productId) => {
    const selectedProduct = productList.find((product) => product.ItemId === productId);
    if (selectedProduct) {
      onAddToInvoice(selectedProduct);
    }
  };

  return (
    <div className="overlay-window bg-light p-4">
      <h2 className="text-center mb-4">Products</h2>
      {productList && productList.length > 0 ? (
        productList.map((product) => (
          <div key={product.ItemId} className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
            <div>
              <p className="mb-0">{product.ItemName}</p>
              <p className="text-muted">Price: {product.ItemPrice}</p>
              <p className="text-muted">Description: {product.ItemDescription}</p>
            </div>
            <div>
              <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditProduct(product.ItemId)}>Edit</Button>
              <Button variant="success" size="sm" onClick={() => handleAddToInvoiceClick(product.ItemId)}>Add to Invoice</Button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center">No products available</p>
      )}
      <Button variant="success" onClick={handleAddProduct} className="me-2">Add Product</Button>
      <Button variant="secondary" onClick={onClose}>Close</Button>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="productName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="ItemName" value={editedProduct.ItemName} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="productDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" name="ItemDescription" value={editedProduct.ItemDescription} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="productPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" name="ItemPrice" value={editedProduct.ItemPrice} onChange={handleInputChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveEditedProduct}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductList;
