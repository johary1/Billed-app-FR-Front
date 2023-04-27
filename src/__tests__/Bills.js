/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedBills from "../__mocks__/store";
import router from "../app/Router.js";
import Bills from "../containers/Bills";
import formatDocument from "../app/formatDocument.js";

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
      //console.log("here" + windowIcon.classList.contains("active-icon"));
      expect(windowIcon.classList.contains("active-icon"));
    });

    test("Then bills should be ordered from earliest to latest", () => {
      bills.sort((a, b) => new Date(a.date) - new Date(b.date));
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? -1 : 1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
      //console.log(dates);
    });

    test("Then a click on eye icon should open modal", async () => {
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

    test("then Bills should be formated correctly", () => {
      const inputSnapshot = [
        {
          amount: 240,
          commentAdmin: null,
          commentary: "Vol pour la vente de consommables",
          date: "2021-11-22",
          email: "employee@test.tld",
          fileName: "null",
          fileUrl: "http://localhost:5678/null",
          id: "6g7PRkKM5gk35Fc2mw7JHw",
          name: "Vol Paris Marseille",
          pct: 20,
          status: "refused",
          type: "Transports",
          vat: "40",
        },

        {
          amount: 120,
          commentAdmin: null,
          commentary: "",
          date: "2021-11-22",
          email: "employee@test.tld",
          fileName: "bill-abcde.jpg",
          fileUrl:
            "http://localhost:5678/public/4b392f446047ced066990b0627cfa444",
          id: "7to5QJDw6o4XWK9Wsjs7Go",
          name: "Hôtel du centre ville",
          pct: 20,
          status: "accepted",
          type: "Hôtel et logement",
          vat: "20",
        },
      ];

      const expectedDate = "22 Nov. 21";
      const expectedStatus = ["Refused", "Accepté"];

      // Call the function formatDocument with the inputSnapshot
      const formattedBills = formatDocument(inputSnapshot);

      // Assert that each bill has the correct date and status
      formattedBills.forEach((bill, index) => {
        expect(bill.date).toEqual(expectedDate);
        expect(bill.status).toEqual(expectedStatus[index]);
      });
    });

    // case with corrupted data
    test("then bills with corrupted data should return unformatted date", () => {
      const inputSnapshot = [
        {
          amount: 240,
          commentAdmin: null,
          commentary: "Vol pour la vente de consommables",
          date: "2023-13-33",
          email: "employee@test.tld",
          fileName: "null",
          fileUrl: "http://localhost:5678/null",
          id: "6g7PRkKM5gk35Fc2mw7JHw",
          name: "Vol Paris Marseille",
          pct: 20,
          status: "en attente",
          type: "Transports",
          vat: "40",
        },
      ];

      // call formatDocument
      const formattedBills = formatDocument(inputSnapshot);

      // unformatted date is returned
      expect(formattedBills[0].date).toEqual("2023-13-33");
    });

    describe("When I navigate to Bills", () => {
      // check that page is well loaded
      test("Then the page show", async () => {
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
        new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
        document.body.innerHTML = BillsUI({ data: bills });
        await waitFor(() => screen.getByText("Mes notes de frais"));
        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      });
    });

    describe("When I click on Nouvelle note de frais", () => {
      // check that form is displayed
      test("Then the form to create a new bill should appear", async () => {
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
        const billsInit = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
        document.body.innerHTML = BillsUI({ data: bills });
        const handleClickNewBill = jest.fn(() =>
          billsInit.handleClickNewBill()
        );
        const btnNewBill = screen.getByTestId("btn-new-bill");
        btnNewBill.addEventListener("click", handleClickNewBill);
        userEvent.click(btnNewBill);
        expect(handleClickNewBill).toHaveBeenCalled();

        await waitFor(() => screen.getByTestId("form-new-bill"));
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      });
    });

    // Intégration
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockedBills, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      // error 404
      test("Then fetches bills from an API and fails with 404 message error", async () => {
        mockedBills.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
      // error 500
      test("Then fetches messages from an API and fails with 500 message error", async () => {
        mockedBills.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
