import { formatDate, formatStatus } from "./format.js";
const formatDocument = (snapshot) => {
  console.log(snapshot);
  const bills = snapshot.map((doc) => {
    try {
      return {
        ...doc,
        date: formatDate(doc.date),
        status: formatStatus(doc.status),
      };
    } catch (e) {
      // if for some reason, corrupted data was introduced, we manage here failing formatDate function
      // log the error and return unformatted date in that case
      console.log(e, "for", doc);
      return {
        ...doc,
        date: doc.date,
        status: formatStatus(doc.status),
      };
    }
  });
  console.log("length", bills.length);
  return bills;
};
/* used in Bills.js in both containers and _tests_ folders to format data */
export default formatDocument;
