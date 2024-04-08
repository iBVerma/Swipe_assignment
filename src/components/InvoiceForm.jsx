import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {Toast} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import InvoiceItem from "./InvoiceItem";
import InvoiceModal from "./InvoiceModal";
import { BiArrowBack } from "react-icons/bi";
import InputGroup from "react-bootstrap/InputGroup";
import { useDispatch, useSelector } from "react-redux";
import { addInvoice, updateInvoice } from "../redux/invoicesSlice";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import generateRandomId from "../utils/generateRandomId";
import { useInvoiceListData } from "../redux/hooks";
import ProductList from "../pages/ProductList";
import { updateInvoiceProduct } from "../redux/invoicesSlice";
import { UpdateProduct } from "../redux/ProductSlice";

const NotificationToast = ({ show, onClose, message, variant, delay }) => {
  return (
    <Toast onClose={() => onClose(false)} show={show} delay={delay} autohide bg={variant} className="mx-auto text-light" style={{ position: "fixed", top: 5, right: 20, zIndex: 9999 }}>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
};


const InvoiceForm = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isCopy = location.pathname.includes("create");
  const isEdit = location.pathname.includes("edit");
  const [showProducts, setShowProducts] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", variant: "success", delay: 1000 });


  const toggleProductsOverlay = () => {
    setShowProducts(!showProducts);
  };


  const [isOpen, setIsOpen] = useState(false);
  const [copyId, setCopyId] = useState("");
  const { getOneInvoice, listSize } = useInvoiceListData();
  const [formData, setFormData] = useState(
    isEdit
      ? getOneInvoice(params.id)
      : isCopy && params.id
      ? {
          ...getOneInvoice(params.id),
          id: generateRandomId(),
          invoiceNumber: listSize + 1,
        }
      : {
          id: generateRandomId(),
          currentDate: new Date().toLocaleDateString(),
          invoiceNumber: listSize + 1,
          dateOfIssue: "",
          billTo: "",
          billToEmail: "",
          billToAddress: "",
          billFrom: "",
          billFromEmail: "",
          billFromAddress: "",
          notes: "",
          total: "0.00",
          subTotal: "0.00",
          taxRate: "",
          taxAmount: "0.00",
          discountRate: "",
          discountAmount: "0.00",
          currency: "$",
          items: [
            {
              itemId: 0,
              itemName: "",
              itemDescription: "",
              itemPrice: "1.00",
              itemQuantity: 1,
              itemCategory: "Misc",
            },
          ],
        }
  );

  useEffect(() => {
    handleCalculateTotal();
  }, []);

  const handleAddToInvoice = (selectedProduct) => {

    const itemWithEmptyFields = formData.items.find((item) => item.itemName === "" && item.itemDescription === "");
    // if the form contains a item with empty fields then just replace it with this product from products tab
    if (itemWithEmptyFields) {
      itemWithEmptyFields.itemName = selectedProduct.ItemName;
      itemWithEmptyFields.itemDescription= selectedProduct.ItemDescription;
      itemWithEmptyFields.itemPrice = selectedProduct.ItemPrice;
      itemWithEmptyFields.itemId = selectedProduct.ItemId;
      itemWithEmptyFields.itemCategory = selectedProduct.ItemCategory;
      handleCalculateTotal();
      return;
    }

    const itemExists = formData.items.find((item) => item.itemId === selectedProduct.ItemId);
    // when the product already exists in the form then just increase the qty by 1 and change other data if not same
    if(itemExists){
      itemExists.itemQuantity += 1;
      itemExists.ItemDescription = selectedProduct.ItemDescription;
      itemExists.itemPrice = selectedProduct.ItemPrice;
      itemExists.itemCategory = selectedProduct.ItemCategory;
      itemExists.itemName = selectedProduct.ItemName;
      handleCalculateTotal();
      return;
    }

    // for brand new product, just add it to form
    const newItem = {
      itemId: selectedProduct.ItemId,
      itemName: selectedProduct.ItemName,
      itemDescription: selectedProduct.ItemDescription,
      itemPrice: selectedProduct.ItemPrice,
      itemQuantity: 1,
      itemCategory: selectedProduct.ItemCategory,
    };
    
    
    setFormData(prevFormData => ({
      ...prevFormData,
      items: [...prevFormData.items, newItem]
    }));
    handleCalculateTotal();

  };
  

  const handleRowDel = (itemToDelete) => {
    const updatedItems = formData.items.filter(
      (item) => item.itemId !== itemToDelete.itemId
    );
    setFormData({ ...formData, items: updatedItems });
    handleCalculateTotal();
  };

  const handleAddEvent = () => {
    const id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
    const newItem = {
      itemId: id,
      itemName: "",
      itemDescription: "",
      itemPrice: "1.00",
      itemQuantity: 1,
      itemCategory: "Misc", // by default the category of the product is Misc
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
    handleCalculateTotal();
  };

  const handleCalculateTotal = () => {
    setFormData((prevFormData) => {
      let subTotal = 0;

      prevFormData.items.forEach((item) => {
        subTotal +=
          parseFloat(item.itemPrice).toFixed(2) * parseInt(item.itemQuantity);
      });

      const taxAmount = parseFloat(
        subTotal * (prevFormData.taxRate / 100)
      ).toFixed(2);
      const discountAmount = parseFloat(
        subTotal * (prevFormData.discountRate / 100)
      ).toFixed(2);
      const total = (
        subTotal -
        parseFloat(discountAmount) +
        parseFloat(taxAmount)
      ).toFixed(2);

      return {
        ...prevFormData,
        subTotal: parseFloat(subTotal).toFixed(2),
        taxAmount,
        discountAmount,
        total,
      };
    });
  };

  const onItemizedItemEdit = (evt, id) => {
    const updatedItems = formData.items.map((oldItem) => {
      if (oldItem.itemId === id) {
        return { ...oldItem, [evt.target.name]: evt.target.value };
      }
      return oldItem;
    });

    setFormData({ ...formData, items: updatedItems });
    handleCalculateTotal();
  };

  const editField = (name, value) => {
    setFormData({ ...formData, [name]: value });
    handleCalculateTotal();
  };

  const onCurrencyChange = (selectedOption) => {
    setFormData({ ...formData, currency: selectedOption.currency });
  };

  const openModal = (event) => {
    event.preventDefault();
    handleCalculateTotal();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleAddInvoice = () => {

    if (
      !formData.billTo ||
      !formData.billToEmail ||
      !formData.billToAddress ||
      !formData.dateOfIssue
    ) {
      setNotification({ show: true, message: "Please Fill out all fields!", variant: "danger", delay: 1000 });
      return; 
    }
    
    if (isEdit || isCopy) {
      
      const hasEmptyFields = formData.items.some((item) => item.itemName === "" );
      // if items contains an empty item
      if(hasEmptyFields){
        setNotification({ show: true, message: "Please Fill out all fields!", variant: "danger", delay: 1000 });
        return;
      }

      formData.items.forEach((item) => {
        const newproduct = {
          ItemId: item.itemId,
          ItemName: item.itemName,
          ItemDescription: item.itemDescription,
          ItemPrice: item.itemPrice,
          ItemCategory: item.itemCategory,
        };
        dispatch(updateInvoiceProduct({ productId: item.itemId, newproduct }));
        dispatch(UpdateProduct({ productID: item.itemId, newproduct }));
      });

      if(isEdit){
        dispatch(updateInvoice({ id: params.id, updatedInvoice: formData }));
        setNotification({ show: true, message: "Invoice Updated!", variant: "success", delay: 1000 });
      }else{
        dispatch(addInvoice({ id: generateRandomId(), ...formData }));
        setNotification({ show: true, message: "Invoice Added!", variant: "success", delay: 1000 });
      }
      
    } else {
      
      const hasEmptyFields = formData.items.some((item) => item.itemName === "" );
      if(hasEmptyFields){
        setNotification({ show: true, message: "Please Fill out all fields!", variant: "danger", delay: 1000 });
        return;
      }
      
      dispatch(addInvoice(formData));
      setNotification({ show: true, message: "Invoice Added!", variant: "success", delay: 1000 });
    }
    
    setTimeout(() => {
      navigate('/');
    }, 500); 
  };
  

  const handleCopyInvoice = () => {
    const recievedInvoice = getOneInvoice(copyId);
    if (recievedInvoice) {
      setFormData({
        ...recievedInvoice,
        id: formData.id,
        invoiceNumber: formData.invoiceNumber,
      });
    } else {
      setNotification({ show: true, message: "Invoice Doesnt Exist!", variant: "danger", delay: 1000 });
      
    }

  };


  return (
    <Form onSubmit={openModal}>
      <div className="d-flex align-items-center">
        <div className="fw-bold mt-1 mx-2 cursor-pointer">
          <Link to="/">
            <BiArrowBack size={30} />
          </Link>
        </div>

        <NotificationToast 
          show={notification.show} 
          onClose={() => setNotification({ ...notification, show: false })} 
          message={notification.message} 
          variant={notification.variant} 
          delay={notification.delay} 
          style={{ position: "fixed", top: 5, right: 20, zIndex: 9999 }}
          />

      </div>

      <Row>
        <Col md={8} lg={9}>
          <Card className="p-4 p-xl-5 my-3 my-xl-4">
            <div className="d-flex flex-row align-items-start justify-content-between mb-3">
              <div className="d-flex flex-column">
                <div className="d-flex flex-column">
                  <div className="mb-2">
                    <span className="fw-bold">Current&nbsp;Date:&nbsp;</span>
                    <span className="current-date">{formData.currentDate}</span>
                  </div>
                </div>
                <div className="d-flex flex-row align-items-center">
                  <span className="fw-bold d-block me-2">Due&nbsp;Date:</span>
                  <Form.Control
                    type="date"
                    value={formData.dateOfIssue}
                    name="dateOfIssue"
                    onChange={(e) => editField(e.target.name, e.target.value)}
                    style={{ maxWidth: "150px" }}
                    required
                  />
                </div>
              </div>
              <div className="d-flex flex-row align-items-center">
                <span className="fw-bold me-2">Invoice&nbsp;Number:&nbsp;</span>
                <Form.Control
                  type="number"
                  value={formData.invoiceNumber}
                  name="invoiceNumber"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  min="1"
                  style={{ maxWidth: "70px" }}
                  required
                />
              </div>
            </div>
            <hr className="my-4" />
            <Row className="mb-5">
              <Col>
                <Form.Label className="fw-bold">Bill to:</Form.Label>
                <Form.Control
                  placeholder="Who is this invoice to?"
                  rows={3}
                  value={formData.billTo}
                  type="text"
                  name="billTo"
                  className="my-2"
                  required
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  autoComplete="name" 
                />
                <Form.Control
                  placeholder="Email address"
                  value={formData.billToEmail}
                  type="email"
                  name="billToEmail"
                  className="my-2"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  autoComplete="email"
                  required
                />
                <Form.Control
                  placeholder="Billing address"
                  value={formData.billToAddress}
                  type="text"
                  required
                  name="billToAddress"
                  className="my-2"
                  autoComplete="address"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                />
              </Col>
              <Col>
                <Form.Label className="fw-bold">Bill from:</Form.Label>
                <Form.Control
                  placeholder="Who is this invoice from?"
                  rows={3}
                  value={formData.billFrom}
                  type="text"
                  name="billFrom"
                  required
                  className="my-2"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  autoComplete="name"
                />
                <Form.Control
                  placeholder="Email address"
                  value={formData.billFromEmail}
                  type="email"
                  name="billFromEmail"
                  className="my-2"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  autoComplete="email"
                  required
                />
                <Form.Control
                  placeholder="Billing address"
                  value={formData.billFromAddress}
                  type="text"
                  name="billFromAddress"
                  className="my-2"
                  required
                  autoComplete="address"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                />
              </Col>
            </Row>
            <InvoiceItem
              onItemizedItemEdit={onItemizedItemEdit}
              onRowAdd={handleAddEvent}
              onRowDel={handleRowDel}
              currency={formData.currency}
              items={formData.items} 
            />
            <Row className="mt-4 justify-content-end">
              <Col lg={6}>
                <div className="d-flex flex-row align-items-start justify-content-between">
                  <span className="fw-bold">Subtotal:</span>
                  <span>
                    {formData.currency}
                    {formData.subTotal}
                  </span>
                </div>
                <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                  <span className="fw-bold">Discount:</span>
                  <span>
                    <span className="small">
                      ({formData.discountRate || 0}%)
                    </span>
                    {formData.currency}
                    {formData.discountAmount || 0}
                  </span>
                </div>
                <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                  <span className="fw-bold">Tax:</span>
                  <span>
                    <span className="small">({formData.taxRate || 0}%)</span>
                    {formData.currency}
                    {formData.taxAmount || 0}
                  </span>
                </div>
                <hr />
                <div
                  className="d-flex flex-row align-items-start justify-content-between"
                  style={{ fontSize: "1.125rem" }}
                >
                  <span className="fw-bold">Total:</span>
                  <span className="fw-bold">
                    {formData.currency}
                    {formData.total || 0}
                  </span>
                </div>
              </Col>
            </Row>
            <hr className="my-4" />
            <Form.Label className="fw-bold">Notes:</Form.Label>
            <Form.Control
              placeholder="Thanks for your business!"
              name="notes"
              value={formData.notes}
              onChange={(e) => editField(e.target.name, e.target.value)}
              as="textarea"
              className="my-2"
              rows={1}
            />
          </Card>
        </Col>
        <Col md={4} lg={3}>
          <div className="sticky-top pt-md-3 pt-xl-4">
            <Button
              variant="dark"
              onClick={handleAddInvoice}
              className="d-block w-100 mb-2"
            >
              {isEdit ? "Update Invoice" : "Add Invoice"}
            </Button>
            <Button variant="primary" type="submit" className="d-block w-100 mb-2">
              Review Invoice
            </Button>
              <Button
              variant="primary"
              onClick={toggleProductsOverlay}
              className="d-block w-100 mb-2"
            >
              Show Products
            </Button>
            {showProducts && (
              <div className="products-floating-window">
                <ProductList onAddToInvoice={handleAddToInvoice} onClose={toggleProductsOverlay} />
              </div>
            )}
            <InvoiceModal
              showModal={isOpen}
              closeModal={closeModal}
              info={{
                isOpen,
                id: formData.id,
                currency: formData.currency,
                currentDate: formData.currentDate,
                invoiceNumber: formData.invoiceNumber,
                dateOfIssue: formData.dateOfIssue,
                billTo: formData.billTo,
                billToEmail: formData.billToEmail,
                billToAddress: formData.billToAddress,
                billFrom: formData.billFrom,
                billFromEmail: formData.billFromEmail,
                billFromAddress: formData.billFromAddress,
                notes: formData.notes,
                total: formData.total,
                subTotal: formData.subTotal,
                taxRate: formData.taxRate,
                taxAmount: formData.taxAmount,
                discountRate: formData.discountRate,
                discountAmount: formData.discountAmount,
              }}
              items={formData.items}
              currency={formData.currency}
              subTotal={formData.subTotal}
              taxAmount={formData.taxAmount}
              discountAmount={formData.discountAmount}
              total={formData.total}
            />
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Currency:</Form.Label>
              <Form.Select
                onChange={(event) =>
                  onCurrencyChange({ currency: event.target.value })
                }
                className="btn btn-light my-1"
                aria-label="Change Currency"
              >
                <option value="$">USD (United States Dollar)</option>
                <option value="£">GBP (British Pound Sterling)</option>
                <option value="¥">JPY (Japanese Yen)</option>
                <option value="$">CAD (Canadian Dollar)</option>
                <option value="$">AUD (Australian Dollar)</option>
                <option value="$">SGD (Singapore Dollar)</option>
                <option value="¥">CNY (Chinese Renminbi)</option>
                <option value="₿">BTC (Bitcoin)</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="my-3">
              <Form.Label className="fw-bold">Tax rate:</Form.Label>
              <InputGroup className="my-1 flex-nowrap">
                <Form.Control
                  name="taxRate"
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  className="bg-white border"
                  placeholder="0.0"
                  min="0.00"
                  step="0.01"
                  max="100.00"
                />
                <InputGroup.Text className="bg-light fw-bold text-secondary small">
                  %
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
            <Form.Group className="my-3">
              <Form.Label className="fw-bold">Discount rate:</Form.Label>
              <InputGroup className="my-1 flex-nowrap">
                <Form.Control
                  name="discountRate"
                  type="number"
                  value={formData.discountRate}
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  className="bg-white border"
                  placeholder="0.0"
                  min="0.00"
                  step="0.01"
                  max="100.00"
                />
                <InputGroup.Text className="bg-light fw-bold text-secondary small">
                  %
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Control
              placeholder="Enter Invoice ID"
              name="copyId"
              value={copyId}
              onChange={(e) => setCopyId(e.target.value)}
              type="text"
              className="my-2 bg-white border"
            />
            <Button
              variant="primary"
              onClick={handleCopyInvoice}
              className="d-block"
            >
              Copy Old Invoice
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default InvoiceForm;
