import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector, useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { UpdateProduct, AddProduct } from "../redux/ProductSlice";
import generateRandomId from "../utils/generateRandomId";
import { updateInvoiceProduct } from "../redux/invoicesSlice";
import { Toast, Col } from "react-bootstrap";

const NotificationToast = ({ show, onClose, message, variant, delay }) => {
  return (
    <Toast onClose={() => onClose(false)} show={show} delay={delay} autohide bg={variant} className="mx-auto text-light" >
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
};

const ProductList = ({ onClose, onAddToInvoice }) => {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.products);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", variant: "success", delay: 1000 });
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
    if (editedProduct.ItemName === "" || editedProduct.ItemCategory === "") {
      setNotification({ show: true, message: "Fill all fields!", variant: "danger", delay: 1000 });
    } else {
      const ProductIndex = productList.findIndex((item)=> (
        item.ItemName === editedProduct.ItemName &&
        item.ItemDescription === editedProduct.ItemDescription &&
        item.ItemCategory === editedProduct.ItemCategory
      ));
      console.log("check ",ProductIndex);
      if(ProductIndex!==-1){
        dispatch(UpdateProduct({ productID: productList[ProductIndex].ItemId, newproduct: editedProduct }));
        dispatch(updateInvoiceProduct({ productId: productList[ProductIndex].ItemId, newproduct: editedProduct }));
        setNotification({show:true,message:"Similar Product updated!",variant:"danger",delay:1000});
      }else{
        dispatch(UpdateProduct({ productID: editedProduct.ItemId, newproduct: editedProduct }));
        dispatch(updateInvoiceProduct({ productId: editedProduct.ItemId, newproduct: editedProduct }));
        
        setEditedProduct({
          ItemId: "",
          ItemName: "",
          ItemPrice: 0,
          ItemDescription: "",
          ItemCategory: "",
        });
        setNotification({ show: true, message: "Product Added!", variant: "success", delay: 1000 })
      }
      setShowEditModal(false);
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
    setNotification({ show: true, message: "Product Added!", variant: "success", delay: 1000 });
    if (selectedProduct) {
      onAddToInvoice(selectedProduct);
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg">

      <Modal.Header closeButton>
        <div className="d-flex justify-content-between w-100 align-items-center">
          <h4>Products</h4>
          <NotificationToast 
          show={notification.show} 
          onClose={() => setNotification({ ...notification, show: false })} 
          message={notification.message} 
          variant={notification.variant} 
          delay={notification.delay} 
          />
          <div>
            <Button variant="success" onClick={handleAddProduct} className="me-2">Add Product</Button>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="overflow-auto" style={{ maxHeight: "70vh" }}>
        {productList && productList.length > 0 ? (
          productList.map((product) => (
            <div key={product.ItemId} className="card mb-3">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title">{product.ItemName}</h5>
                  <p className="card-text text-muted">Price: ${product.ItemPrice}</p>
                  <p className="card-text text-muted">Description: {product.ItemDescription}</p>
                  <p className="card-text text-muted">Category: {product.ItemCategory}</p>
                </div>
                <div>
                  <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditProduct(product.ItemId)}>Edit</Button>
                  <Button variant="success" size="sm" onClick={() => handleAddToInvoiceClick(product.ItemId)}>Add to Invoice</Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No products available</p>
        )}
      </Modal.Body>
      <Modal.Footer>
      </Modal.Footer>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
          <Col xs={6} className="mx-auto">
          <NotificationToast show={notification.show} 
          onClose={() => setNotification({ ...notification, show: false })} 
          message={notification.message} 
          variant={notification.variant} 
          delay={notification.delay} 
          />
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
              <Form.Control as="select" name="ItemCategory" value={editedProduct.ItemCategory} onChange={handleInputChange}>
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
