import "bootstrap/dist/css/bootstrap.min.css";
import {Toast} from "react-bootstrap";

const NotificationToast = ({ show, onClose, message, variant, delay }) => {
    return (
      <Toast onClose={() => onClose(false)} show={show} delay={delay} autohide bg={variant} className="mx-auto text-light" style={{ position: "fixed", top: 5, right: 20, zIndex: 9999 }}>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    );
  };

  export default NotificationToast;