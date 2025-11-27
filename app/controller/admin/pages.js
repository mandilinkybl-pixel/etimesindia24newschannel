// controllers/AdminPagesController.js
const National = require("../../models/National"); //1
const Business =require("../../models/Business") //2
const User = require("../../models/user"); // 0
const health =require("../../models/Health") //3
const tech =require("../../models/Technology")//4
const education =require("../../models/Education")//5
const entertainment =require("../../models/Entertainment")//6
const environment =require("../../models/Environment")//7
const live =require("../../models/Live")//8
const science =require("../../models/Science")//9
const sports =require("../../models/Sports")//10
const crime =require("../../models/Crime")//11
const world =require("../../models/World")//12
const politics =require("../../models/Politics")//13

class AdminPagesController {
    dashboard = async (req, res) => {
        try {
            // req.user comes from middleware (has id & role)
            const admin = await User.findById(req.user.id).select("name email avatar");

            res.render("admin/dashboard", {
                title: "Admin Dashboard",
                user: admin || { name: "Admin", email: "admin@news.com" } // fallback
            });
        } catch (error) {
            console.error("Dashboard Error:", error);
            res.status(500).send("Server Error");
        }
    };

    login = (req, res) => {
        // If already logged in, redirect to dashboard
        if (req.cookies.adminToken) {
            return res.redirect("/admin/dashboard");
        }
        res.render("admin/login", { title: "Admin Login" });
    };

// national
getAllNews = async (req, res) => {
  try {
    const news = await National.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "national",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
getCreateNews = async (req, res) => {
     const news = await National.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "national",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};

// Buissness
getbuissnessAllNews = async (req, res) => {
  try {
    const news = await Business.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "business",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
getbuissnessCreateNews = async (req, res) => {
     const news = await Business.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "business",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};


// health

gethealthsAllNews = async (req, res) => {
  try {
    const news = await health.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "health",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
gethealthsCreateNews = async (req, res) => {
     const news = await health.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "health",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};


// politics

getpoliticsAllNews = async (req, res) => {
  try {
    const news = await politics.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "politics",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
getpoliticsCreateNews = async (req, res) => {
     const news = await politics.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "politics",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};

// tech
gettechAllNews = async (req, res) => {
  try {
    const news = await tech.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "tech",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
gettechCreateNews = async (req, res) => {
     const news = await tech.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "tech",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};

// world
getworldAllNews = async (req, res) => {
  try {
    const news = await world.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "world",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
getworldCreateNews = async (req, res) => {
     const news = await world.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "world",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};

// environment
getenvironmentAllNews = async (req, res) => {
  try {
    const news = await environment.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "environment",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
getenvironmentCreateNews = async (req, res) => {
     const news = await environment.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "environment",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};



// education
geteducationAllNews = async (req, res) => {
  try {
    const news = await education.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "education",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
geteducationCreateNews = async (req, res) => {
     const news = await education.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "education",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};


// entertainment
getentertainmentAllNews = async (req, res) => {
  try {
    const news = await entertainment.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "entertainment",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
getentertainmentCreateNews = async (req, res) => {
     const news = await entertainment.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "entertainment",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};


// science
getscienceAllNews = async (req, res) => {
  try {
    const news = await science.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "science",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
getscienceCreateNews = async (req, res) => {
     const news = await science.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "science",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};


// sports
getsportsAllNews = async (req, res) => {
  try {
    const news = await sports.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "sports",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/sports/dashboard");
  }
};

// GET - Create form
getsportsCreateNews = async (req, res) => {
     const news = await sports.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "sports",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};



// crime
getcrimeAllNews = async (req, res) => {
  try {
    const news = await crime.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "crime",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
getcrimeCreateNews = async (req, res) => {
     const news = await crime.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "crime",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};
// live

getliveAllNews = async (req, res) => {
  try {
    const news = await live.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/view", {
      title: "live",
      news,
      user: req.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    req.flash("error", "Error fetching news");
    res.redirect("/admin/dashboard");
  }
};

// GET - Create form
getliveCreateNews = async (req, res) => {
     const news = await live.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  res.render("admin/create", {
    title: "live",
    user: req.user,
      news,
    errors: [],
    old: {},
     success: req.flash("success"),
      error: req.flash("error"),
  });
};
}

module.exports = new AdminPagesController();