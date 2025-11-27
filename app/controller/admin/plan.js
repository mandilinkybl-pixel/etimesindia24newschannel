const SubscriptionPlan = require("../../models/subscriptionplan");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ============================
// RENDER ONE PAGE (list + form)
// ============================
exports.planPage = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 });

    let editPlan = null;
    if (req.query.edit) {
      editPlan = await SubscriptionPlan.findById(req.query.edit);
    }

    res.render("admin/plans", {
      title: "Subscription Plans",
      plans,
      editPlan,
      user:req.user,
      isEdit: !!editPlan
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// ============================
// CREATE or UPDATE Plan
// ============================
exports.savePlan = async (req, res) => {
  try {
    const { id, name, durationMonths, price, status } = req.body;

    // UPDATE MODE
    if (id) {
      await SubscriptionPlan.findByIdAndUpdate(id, {
        name,
        durationMonths,
        price,
        status,
      });

      return res.redirect("/admin/subscription-plans");
    }

    // CREATE MODE → Create Razorpay Plan
    const razorPlan = await razorpay.plans.create({
      period: "monthly",
      interval: durationMonths,
      item: {
        name,
        amount: price * 100,
        currency: "INR",
      },
    });

    await SubscriptionPlan.create({
      name,
      durationMonths,
      price,
      razorpayPlanId: razorPlan.id,
      status: "active",
    });

    res.redirect("/admin/subscription-plans");

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// ============================
// DELETE PLAN
// ============================
exports.deletePlan = async (req, res) => {
  try {
    await SubscriptionPlan.findByIdAndDelete(req.params.id);
    res.redirect("/admin/subscription-plans");
  } catch (error) {
    res.status(500).send(error.message);
  }
};
