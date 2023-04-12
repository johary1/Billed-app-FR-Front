import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];

    // Call helper functions to handle file extension validation and form data creation
    //const fileExtension = this.getFileExtension(fileName);
    const allowedExtensions = /(\.jpeg|\.jpg|\.png)$/i;
    const errorExtensions = this.getErrorElement();

    if (!allowedExtensions.exec(fileName)) {
      // Display error to user if not allowed extension
      this.displayError(
        errorExtensions,
        "Type de fichier non valide.</br>Format acceptés: jpeg, jpg ou png."
      );
      e.target.value = "";
      return;
    } else {
      this.clearError(errorExtensions);
    }

    const formData = this.createFormData(file, fileName);
    const email = this.getUserEmail();
    formData.append("email", email);

    // Call store's create method to upload file
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        console.log(fileUrl); //undefined if error
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      })
      .catch((error) => console.error(error));
  };

  // Helper functions
  getFileExtension = (fileName) => {
    return fileName.split(".").pop();
  };

  getErrorElement = () => {
    return document.querySelector("small");
  };

  displayError = (errorElement, errorMessage) => {
    errorElement.innerHTML = `<p>${errorMessage}</p>`;
  };

  clearError = (errorElement) => {
    errorElement.innerHTML = "";
  };

  createFormData = (file, fileName) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", fileName);
    return formData;
  };

  getUserEmail = () => {
    return JSON.parse(localStorage.getItem("user")).email;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
