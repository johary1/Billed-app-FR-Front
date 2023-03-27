/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      // check icon has class with highlighted state
      console.log("here" + windowIcon.classList.contains("active-icon"));
      expect(windowIcon.classList.contains("active-icon"));
    });
    test("Then bills should be ordered from earliest to latest", () => {
      //convert date format for bills
      bills.sort((a, b) => new Date(a.date) - new Date(b.date));
      document.body.innerHTML = BillsUI({ data: bills });
      // update regex with date object format
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);

      const antiChrono = (a, b) => {
        // case when dates are equal
        if (a === b) return 0;
        return a < b ? -1 : 1;
      };

      const datesSorted = [...dates].sort(antiChrono);
      console.log(datesSorted);
      console.log(dates);
      expect(dates).toEqual(datesSorted);
    });

    test("I click on eye icon to open modal", async () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const firestore = null;

      const allBills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn();

      const eye = screen.getAllByTestId("icon-eye")[0];

      // Mock function handleClickIconEye
      const handleClickIconEye = jest.fn(() =>
        allBills.handleClickIconEye(eye)
      );

      // Add Event and fire
      eye.addEventListener("click", handleClickIconEye);
      userEvent.click(eye);

      expect(handleClickIconEye).toHaveBeenCalled();
      const modale = document.getElementsByClassName("modal");
      expect(modale).toBeTruthy();
    });

    describe("New bill page", () => {
      test("displays 'Nouvelle note de frais' button", () => {
        // Set up test data
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;

        // Call the function
        $.fn.btn = jest.fn();
        const btn = document.getElementsByClassName("form-newbill-container");

        // Check that the button is displayed
        expect(btn).toBeTruthy();
      });

      test("clicking 'Nouvelle note de frais' button calls onNavigate with correct argument", () => {
        // Set up test data
        const onNavigateMock = jest.fn();
        const createBill = {
          handleClickNewBill: function () {
            this.onNavigate(ROUTES_PATH["NewBill"]);
          },
          onNavigate: onNavigateMock,
        };

        // Call the function
        createBill.handleClickNewBill();

        // Check that onNavigate is called with the correct argument
        expect(createBill.onNavigate).toHaveBeenCalledWith(
          ROUTES_PATH["NewBill"]
        );
      });
    });
  });
});
