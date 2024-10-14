import User from "../models/User.model.js";

// Format data to send back after authentication
const formatDataToSend = async (user) => {
    return {
        name: user.name,
        email: user.email,
        role: user.role,
        token: await user.generateAuthToken(),
    };
};

// @desc    Register a new user (customer or driver)
// @route   POST /api/auth/register
export const signUp = async (req, res) => {
    const { name, email, password, role } = req.body;

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    // Validate user input
    if (!name || name.length < 3) {
        return res.status(400).json({ error: "Please provide valid name of atlest 3 length." });
    }

    if (!email) {
        return res.status(400).json({ error: "Please provide a valid email" });
    }

    if(!password || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    if(!emailRegex.test(email)) {
        return res.status(403).send({error: "Email is invalid"});
    }

    if(!passwordRegex.test(password)) {
        return res.status(403).send({error: "Password must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters"});
    }

    if (!['customer', 'driver'].includes(role)) {
        return res.status(400).json({ error: "Invalid role. Must be either 'customer' or 'driver'." });
    }

    // Check if email already exists
    const isEmailTaken = await User.findOne({ email });
    if (isEmailTaken) {
        return res.status(400).json({ error: "Email is already registered" });
    }

    // Create and save the new user
    const user = new User({
        name,
        email,
        password,
        role,
    });

    await user.save();

    // Format response and send token
    const data = await formatDataToSend(user);
    return res.status(201).json(data);
};


// @desc    Login user (customer or driver)
// @route   POST /api/auth/login
export const signIn = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    // Format response and send token
    const data = await formatDataToSend(user);
    return res.status(200).json(data);
};
