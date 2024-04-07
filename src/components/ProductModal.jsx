import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ProductList from "./ProductList"; // Assuming you have a ProductList component to display products

const ProductModal = ({ show, handleClose, handleAddToInvoice }) => {
  const [selectedProduct, setSelectedProduct] = React.useState(null);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleAddToInvoiceAndClose = () => {
    if (selectedProduct) {
      handleAddToInvoice(selectedProduct);
      setSelectedProduct(null);
      handleClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Products</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProductList onSelect={handleProductSelect} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleAddToInvoiceAndClose}>
          Add to Invoice
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
