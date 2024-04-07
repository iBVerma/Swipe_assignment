import { useSelector } from "react-redux";
import { selectInvoiceList } from "./invoicesSlice";
import { selectProducts } from "./ProductSlice";

export const useInvoiceListData = () => {
  const invoiceList = useSelector(selectInvoiceList);

  const getOneInvoice = (receivedId) => {
    return (
      invoiceList.find(
        (invoice) => invoice.id.toString() === receivedId.toString()
      ) || null
    );
  };

  const listSize = invoiceList.length;

  return {
    invoiceList,
    getOneInvoice,
    listSize,
  };
};

export const useProductData = () => {
  const productList = useSelector(selectProducts);

  const getOneProduct = (receivedId) => {
    return (
      productList.find(
        (product) => product.id.toString() === receivedId.toString()
      ) || null
    );
  };

  const listSize = productList.length;

  return {
    productList,
    getOneProduct,
    listSize,
  };
};
