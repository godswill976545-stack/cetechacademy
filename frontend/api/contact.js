export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, email, program } = req.body ?? {};

    if (!name || !email || !program) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Please provide name, email, and program.",
      });
    }

    const newInquiry = {
      id: Date.now().toString(),
      name,
      email,
      program,
      date: new Date().toISOString(),
    };

    // If you later want persistence, save to Supabase / DB here.
    return res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: newInquiry,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong processing your inquiry.",
    });
  }
}

