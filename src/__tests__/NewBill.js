/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockedBills from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";

jest.mock("../app/Store.js", () => mockedBills);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I should see the title for NewBill form", () => {
      const html = NewBillUI();
      //console.log(html);
      document.body.innerHTML = html;
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
    test("Then all form fields should be on document", () => {
      const formId = screen.getByTestId("form-new-bill");
      const btnSubmit = document.getElementById("btn-send-bill");
      expect(formId).toBeTruthy();
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("amount")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
      expect(btnSubmit).toBeTruthy();
    });
  });

  describe("When I do fill fields  and I click on employee button Envoyer", () => {
    test("Then it should renders NewBills page", async () => {
      document.body.innerHTML = NewBillUI();

      const inputExpenseType = screen.getByTestId("expense-type");
      fireEvent.change(inputExpenseType, {
        target: { value: "Services en ligne" },
      });
      expect(inputExpenseType.value).toBe("Services en ligne");
      expect(inputExpenseType.value).not.toBe("Transports");

      const inputExpenseName = screen.getByTestId("expense-name");
      fireEvent.change(inputExpenseName, { target: { value: "achat" } });
      expect(inputExpenseName.value).toBe("achat");

      const inputVat = screen.getByTestId("vat");
      fireEvent.change(inputVat, { target: { value: "10" }, type: "number" });
      expect(inputVat).toBeValid();
      const inputPct = screen.getByTestId("pct");
      fireEvent.change(inputPct, { target: { value: "" } });
      expect(inputPct.value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(document.querySelector("small").innerHTML).toBe("");
    });
  });

  // test d'intégration POST
  describe("Given I am connected as an employee", () => {
    describe("When I submit a new Bill", () => {
      test("Then it should save the bill", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBillInit = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });

        const formNewBill = screen.getByTestId("form-new-bill");
        expect(formNewBill).toBeTruthy();

        const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
      });

      // check file is uploaded on submit
      test("Then the file bill should be uploaded", async () => {
        jest.spyOn(mockedBills, "bills");

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        Object.defineProperty(window, "location", {
          value: { hash: ROUTES_PATH["NewBill"] },
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBillInit = new NewBill({
          document,
          onNavigate,
          store: mockedBills,
          localStorage: window.localStorage,
        });

        const file = new File(["image"], "image.png", { type: "image/png" });
        const handleChangeFile = jest.fn((e) =>
          newBillInit.handleChangeFile(e)
        );
        const formNewBill = screen.getByTestId("form-new-bill");
        const billFile = screen.getByTestId("file");

        billFile.addEventListener("change", handleChangeFile);
        userEvent.upload(billFile, file);

        expect(billFile.files[0].name).toBeDefined();
        expect(handleChangeFile).toBeCalled();

        const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("When I test each helper function one by one", () => {
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "test@example.com",
      })
    );

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    const html = NewBillUI();
    document.body.innerHTML = html;

    let newBill = new NewBill({
      document,
      onNavigate,
      store: mockedBills,
      localStorage: window.localStorage,
    });

    test("Then it should return the correct file extension", () => {
      const fileName1 = "file.jpg";
      const fileName2 = "document.pdf";
      const fileName3 = "image.png";

      const fileExtension1 = newBill.getFileExtension(fileName1);
      const fileExtension2 = newBill.getFileExtension(fileName2);
      const fileExtension3 = newBill.getFileExtension(fileName3);

      expect(fileExtension1).toBe("jpg");
      expect(fileExtension2).toBe("pdf");
      expect(fileExtension3).toBe("png");
    });

    test("Then it should return the correct error element", () => {
      // Mock the DOM element
      document.body.innerHTML =
        '<div><small id="errorElement">Error message</small></div>';

      const errorElement = newBill.getErrorElement();
      expect(errorElement.id).toBe("errorElement");
    });

    test("Then it should display the correct error message", () => {
      // Mock the DOM element
      document.body.innerHTML = '<div><small id="errorElement"></small></div>';
      const errorElement = newBill.getErrorElement();

      const errorMessage =
        "Type de fichier non valide.<br>Format acceptés: jpeg, jpg ou png.";
      newBill.displayError(errorElement, errorMessage);
      expect(errorElement.innerHTML).toBe(`<p>${errorMessage}</p>`);
    });

    test("Then it should clear the error message", () => {
      // Mock the DOM element
      document.body.innerHTML =
        '<div><small id="errorElement">Error message</small></div>';

      const errorElement = newBill.getErrorElement();
      newBill.clearError(errorElement);
      expect(errorElement.innerHTML).toBe("");
    });

    test("Then it should create the correct FormData object", () => {
      const file = new File(["image"], "image.png", { type: "image/png" });
      const fileName = "image.png";
      //console.log(fileName);
      const formData = newBill.createFormData(file, fileName);
      expect(formData.get("file")).toBe(file);
      expect(formData.get("name")).toBe(fileName);
    });

    test("Then it should return the correct user email from localStorage", () => {
      // Mock the localStorage
      const userEmail = "test@example.com";
      const emailStored = window.localStorage.setItem(
        "user",
        JSON.stringify({
          email: userEmail,
        })
      );

      const email = newBill.getUserEmail();
      expect(email).toBe(emailStored);
    });
  });
});
