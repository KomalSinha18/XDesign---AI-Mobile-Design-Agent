"use client";
import React, { useState } from "react";
import Header from "./header";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Rocket } from "lucide-react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PricingSection = () => {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanClick = async (planName: string, href?: string) => {
    // If it's a mailto link, don't send email (it will open email client)
    if (href?.startsWith("mailto:")) {
      return;
    }

    // If it's a disabled button (Current Plan), don't send email
    if (planName === "Free" && user) {
      return;
    }

    setLoadingPlan(planName);

    try {
      // Send email notification
      await axios.post("/api/contact", {
        planName,
        userEmail: user?.email || "Not provided",
        userName: user?.given_name || user?.family_name || "Guest",
      });

      toast.success(`Thank you for your interest in ${planName}! We'll be in touch soon.`);

      // If there's a href and it's not mailto, navigate to it
      if (href && !href.startsWith("mailto:")) {
        router.push(href);
      }
    } catch (error: any) {
      console.error("Error sending email:", error);
      
      // Show more detailed error message
      const errorMessage = 
        error?.response?.data?.error || 
        error?.response?.data?.details ||
        error?.message || 
        "Failed to send notification";
      
      // Check if it's a configuration error
      if (errorMessage.includes("RESEND_API_KEY") || errorMessage.includes("not configured")) {
        toast.error("Email service not configured. Please contact support.");
      } else {
        toast.error(errorMessage);
      }
      
      // Still navigate even if email fails
      if (href && !href.startsWith("mailto:")) {
        router.push(href);
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out our platform",
      icon: Sparkles,
      features: [
        "3 projects per month",
        "Basic AI generation",
        "Standard themes",
        "Community support",
        "Export as PNG",
      ],
      cta: user ? "Current Plan" : "Get Started",
      popular: false,
      href: user ? undefined : "/",
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "For professionals and teams",
      icon: Zap,
      features: [
        "Unlimited projects",
        "Advanced AI generation",
        "All premium themes",
        "Priority support",
        "Export as PNG & SVG",
        "Custom branding",
        "API access",
        "Early access to features",
      ],
      cta: "Upgrade to Pro",
      popular: true,
      href: user ? "/" : "/",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large organizations",
      icon: Rocket,
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "On-premise deployment",
        "Advanced security",
        "Team collaboration tools",
        "Custom training & support",
      ],
      cta: "Contact Sales",
      popular: false,
      href: "mailto:sales@example.com",
    },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col">
        <Header />
        <div className="relative overflow-hidden pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
                Simple, transparent <span className="text-primary">pricing</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that's right for you. All plans include our core
                features with no hidden fees.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.name}
                    className={`relative flex flex-col rounded-2xl border p-8 transition-all hover:shadow-lg ${
                      plan.popular
                        ? "border-primary shadow-lg scale-105 bg-card"
                        : "border-border bg-card"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`p-2 rounded-lg ${
                          plan.popular
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-semibold">{plan.name}</h3>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        {plan.period && (
                          <span className="text-muted-foreground">
                            /{plan.period}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.href && plan.href.startsWith("mailto:") ? (
                      <a href={plan.href}>
                        <Button
                          className={`w-full ${
                            plan.popular
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-secondary hover:bg-secondary/80"
                          }`}
                          variant={plan.popular ? "default" : "secondary"}
                          onClick={() => handlePlanClick(plan.name, plan.href)}
                        >
                          {plan.cta}
                        </Button>
                      </a>
                    ) : plan.href ? (
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-primary hover:bg-primary/90"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                        variant={plan.popular ? "default" : "secondary"}
                        onClick={() => handlePlanClick(plan.name, plan.href)}
                        disabled={loadingPlan === plan.name}
                      >
                        {loadingPlan === plan.name ? "Sending..." : plan.cta}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "secondary"}
                        disabled
                      >
                        {plan.cta}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* FAQ Section */}
            <div className="mt-24 max-w-3xl mx-auto">
              <h2 className="text-3xl font-semibold text-center mb-12">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {[
                  {
                    question: "Can I change plans later?",
                    answer:
                      "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer:
                      "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
                  },
                  {
                    question: "Is there a free trial?",
                    answer:
                      "Yes! Our Free plan is available forever with no credit card required. You can upgrade anytime.",
                  },
                  {
                    question: "Do you offer refunds?",
                    answer:
                      "We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.",
                  },
                ].map((faq, index) => (
                  <div
                    key={index}
                    className="border-b border-border pb-6 last:border-0"
                  >
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div
            className="absolute -translate-x-1/2
             left-1/2 w-[5000px] h-[3000px] top-[80%]
             -z-10"
          >
            <div
              className="-translate-x-1/2 absolute
               bottom-[calc(100%-300px)] left-1/2
               h-[2000px] w-[2000px]
               opacity-20 bg-radial-primary"
            ></div>
            <div
              className="absolute -mt-2.5
              size-full rounded-[50%]
               bg-primary/20 opacity-70
               [box-shadow:0_-15px_24.8px_var(--primary)]"
            ></div>
            <div
              className="absolute z-0 size-full
               rounded-[50%] bg-background"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;

