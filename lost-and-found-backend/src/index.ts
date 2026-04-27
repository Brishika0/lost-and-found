import dotenv from "dotenv";
dotenv.config();

import app from "./server";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
