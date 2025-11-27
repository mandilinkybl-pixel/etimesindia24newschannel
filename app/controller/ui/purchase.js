const Razorpay = require("razorpay");
const Subscription = require("../../models/subscription");
const SubscriptionPlan = require("../../models/subscriptionplan");
const User = require("../../models/user");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Render plan page
exports.getPlanPage = async (req, res) => {
  try {
    console.log("➡️ GET PLAN PAGE | planid =", req.params.planid);
    const plan = await SubscriptionPlan.findById(req.params.planid);

    if (!plan) {
      console.log("❌ Plan not found");
      return res.status(404).send("Plan not found");
    }

    console.log("✔️ Plan loaded:", plan.title);
    res.render("ui/plans", {
      plan,
      user: req.user,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log("❌ ERROR getPlanPage:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Create Razorpay subscription
exports.createSubscription = async (req, res) => {
  console.log("➡️ CREATE SUBSCRIPTION request body:", req.body);

  try {
    const { planId, razorpayPlanId, autoPay } = req.body;
    if (!planId || !razorpayPlanId) {
      console.log("❌ Missing planId or razorpayPlanId");
      return res.json({ success: false, error: "Missing planId / razorpayPlanId" });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      console.log("❌ DB: Plan not found");
      return res.json({ success: false, error: "Plan not found" });
    }

    console.log("📡 Calling Razorpay Subscription API...");
    const razorpaySub = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      total_count: plan.durationMonths,
      customer_notify: 1,
    });

    console.log("✔️ Razorpay Subscription Created:", razorpaySub.id);
    res.json({ success: true, subscriptionId: razorpaySub.id });
  } catch (error) {
    console.log("❌ ERROR createSubscription:", error);
    res.json({ success: false, error: error.message });
  }
};

// Verify payment and save subscription
exports.verifyAndSave = async (req, res) => {
  console.log("➡️ VERIFY PAYMENT & SAVE request body:", req.body);

  try {
    const { paymentId, subscriptionId, planId, autoPay } = req.body;

    if (!paymentId || !subscriptionId || !planId) {
      console.log("❌ Missing data in verify request");
      return res.json({ success: false, error: "Missing paymentId/subscriptionId/planId" });
    }

    const userId = req.user?._id;
    if (!userId) {
      console.log("❌ User not logged in");
      return res.json({ success: false, error: "User not logged in" });
    }

    console.log("🔍 Fetching plan for DB save...");
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      console.log("❌ Plan not found");
      return res.json({ success: false, error: "Plan not found" });
    }

    // Date management
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    console.log("📝 Saving subscription in DB...");
    const subscription = new Subscription({
      userId,
      planId,
      razorpaySubscriptionId: subscriptionId,
      razorpayPaymentId: paymentId,
      status: "active",
      autoRenew: !!autoPay,
      startDate,
      endDate,
    });
    await subscription.save();

    console.log("🔗 Attaching subscription to user record...");
    await User.findByIdAndUpdate(userId, { $push: { subscriptions: subscription._id } });

    console.log("✔️ Subscription Saved Successfully");
    res.json({ success: true });
  } catch (error) {
    console.log("❌ ERROR verifyAndSave:", error);
    res.json({ success: false, error: error.message });
  }
};

// Subscription history
exports.subscriptionHistory = async (req, res) => {
  try {
    console.log("➡️ VIEW SUBSCRIPTION HISTORY for user:", req.user._id);

    const user = await User.findById(req.user._id).populate({
      path: "subscriptions",
      populate: { path: "planId" },
    });

    console.log(`✔️ History Loaded | ${user.subscriptions.length} records`);
    res.render("subscriptions/history", { subscriptions: user.subscriptions });
  } catch (error) {
    console.log("❌ ERROR subscriptionHistory:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Success page
exports.successPage = (req, res) => {
  console.log("➡️ Success page loaded");
  res.render("ui/success");
};
