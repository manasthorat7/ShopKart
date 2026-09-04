import jwt from "jsonwebtoken";

const genToken = (customerId) => {
    return jwt.sign({ customerId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export default genToken;
