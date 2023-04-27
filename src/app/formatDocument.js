import { formatDate, formatStatus } from "./format.js";

const formatDocument = (snapshot) => {
  console.log(snapshot);

  const sortedSnapshot = snapshot.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const bills = sortedSnapshot.map((doc) => {
    try {
      return {
        ...doc,
        date: formatDate(doc.date),
        status: formatStatus(doc.status),
      };
    } catch (e) {
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

export default formatDocument;
