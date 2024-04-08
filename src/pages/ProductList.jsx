import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector, useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { UpdateProduct, AddProduct } from "../redux/ProductSlice";
import generateRandomId from "../utils/generateRandomId";
import { updateInvoiceProduct } from "../redux/invoicesSlice";
import {Toast,Col} from "react-bootstrap"

const ProductList = ({ onClose, onAddToInvoice }) => {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.products);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isError,setError] = useState(false);
  const [isSuccess,setSuccess] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    ItemId: "",
    ItemName: "",
    ItemPrice: 0,
    ItemDescription: "",
    ItemCategory: "",
  });

  const handleEditProduct = (productId) => {
    const productToEdit = productList.find((product) => product.ItemId === productId);
    setEditedProduct(productToEdit);
    setShowEditModal(true);
  };

  const handleSaveEditedProduct = () => {
    if(editedProduct.ItemName === "" || editedProduct.ItemCategory === ""){
      setError(true);
    }else{
      dispatch(UpdateProduct({ productID: editedProduct.ItemId, newproduct: editedProduct }));
      dispatch(updateInvoiceProduct({productId: editedProduct.ItemId,newproduct: editedProduct}));
      setShowEditModal(false);

      setEditedProduct({
        ItemId: "",
        ItemName: "",
        ItemPrice: 0,
        ItemDescription: "",
        ItemCategory: "",
      });
      setSuccess(true);

    }
  };

  const handleAddProduct = () => {
    const newProduct = { 
      ItemId: generateRandomId(), 
      ItemName: "", 
      ItemPrice: 0, 
      ItemDescription: "", 
      ItemCategory: "",
    };
    setEditedProduct(newProduct);
    setShowEditModal(true);
    dispatch(AddProduct(newProduct));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleAddToInvoiceClick = (productId) => {
    const selectedProduct = productList.find((product) => product.ItemId === productId);
    setSuccess(true);
    if (selectedProduct) {
      onAddToInvoice(selectedProduct);
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg">
      
      <Modal.Header closeButton>
        <div className="d-flex justify-content-between w-100 align-items-center">
          <h4>Products</h4>
          <Toast onClose={() =>setSuccess(false)} show={isSuccess} delay={1000} autohide bg='success' className="mx-auto">
            <Toast.Body>Product Added!</Toast.Body>
          </Toast> 
          
          <div>
            <Button variant="success" onClick={handleAddProduct} className="me-2">Add Product</Button>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="overflow-auto" style={{ maxHeight: "70vh" }}>
        {productList && productList.length > 0 ? (
          productList.map((product) => (
            <div key={product.ItemId} className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <div>
                <p className="mb-0">{product.ItemName}</p>
                <p className="text-muted">Price: {product.ItemPrice}</p>
                <p className="text-muted">Description: {product.ItemDescription}</p>
                <p className="text-muted">Category: {product.ItemCategory}</p> {/* Display category */}
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
      </Modal.Body>
      <Modal.Footer>
      </Modal.Footer>

      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header >
          <Modal.Title>Edit Product</Modal.Title>
          <Col xs={6} className="mx-auto">
            <Toast onClose={() => setError(false)} show={isError} delay={1000} autohide  bg="danger" className="mx-auto" >
              <Toast.Body>Fill the Fields!</Toast.Body>
            </Toast> 
            
          </Col>
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
            <Form.Group controlId="productCategory">
              <Form.Label>Category</Form.Label>
              <Form.Control as="select" name="ItemCategory" value={editedProduct.Category} onChange={handleInputChange}>
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Food">Food</option>
                <option value="Misc">Misc</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSaveEditedProduct}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default ProductList;
