"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export default function PasswordStrengthClient() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, feedback: [], crackTime: "0 seconds" };

    let feedback = [];

    // Length check
    // if (pwd.length >= 8) score += 10;
    // if (pwd.length >= 12) score += 10;
    // if (pwd.length >= 16) score += 10;

    // Character variety
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);

    // Bonus for combinations
    if (hasLower && hasUpper && hasNumber && hasSymbol) {
      // Bonus for combinations
    }

    // Penalties
    if (pwd.length < 8) feedback.push({ type: "error", text: "Password is too short (minimum 8 characters)" });
    if (!hasLower) feedback.push({ type: "warning", text: "Add lowercase letters" });
    if (!hasUpper) feedback.push({ type: "warning", text: "Add uppercase letters" });
    if (!hasNumber) feedback.push({ type: "warning", text: "Add numbers" });
    if (!hasSymbol) feedback.push({ type: "warning", text: "Add special characters (!@#$)" });

    // Common patterns (very basic)
    if (/^[a-zA-Z]+$/.test(pwd)) feedback.push({ type: "warning", text: "Letters only is easy to crack" });
    if (/^[0-9]+$/.test(pwd)) feedback.push({ type: "error", text: "Numbers only is very easy to crack" });
    if (/(.)\1{2,}/.test(pwd)) feedback.push({ type: "warning", text: "Avoid repeating characters" });

    // Normalize score to 0-100
    // Max potential score above is 30 (length) + 40 (variety) + 20 (bonus) = 90.
    // Let's adjust.

    // Entropy-ish estimation for crack time
    const poolSize = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasNumber ? 10 : 0) + (hasSymbol ? 32 : 0);
    const entropy = pwd.length * Math.log2(poolSize || 1);

    let timeStr = "Instantly";
    if (entropy > 120) timeStr = "Centuries";
    else if (entropy > 100) timeStr = "Years";
    else if (entropy > 80) timeStr = "Months";
    else if (entropy > 60) timeStr = "Days";
    else if (entropy > 40) timeStr = "Hours";
    else if (entropy > 20) timeStr = "Minutes";

    // Final score adjustment based on entropy
    let finalScore = Math.min(100, Math.max(0, entropy));

    return { score: finalScore, feedback, crackTime: timeStr };
  };

  const { score, feedback, crackTime } = calculateStrength(password);

  const getStrengthLabel = (s) => {
    if (s < 40) return { label: "Weak", color: "text-destructive", progressColor: "bg-destructive" };
    if (s < 70) return { label: "Fair", color: "text-yellow-500", progressColor: "bg-yellow-500" };
    if (s < 90) return { label: "Good", color: "text-primary", progressColor: "bg-primary" };
    return { label: "Strong", color: "text-emerald-600 dark:text-emerald-400", progressColor: "bg-emerald-500" };
  };

  const strength = getStrengthLabel(score);

  return (
    <ToolPageLayout
      title="Password Strength Checker"
      subtitle="Test how secure your password is against cracking attempts."
      toolName="Password Strength Checker"
      toolDescription="Analyze your password's strength instantly in your browser. We check for length, complexity, and entropy to estimate how long it would take a computer to crack it. Your password never leaves your device."
      currentTool="password-strength"
      steps={[
        "Type a password into the input field.",
        "View the real-time strength analysis and crack time estimation.",
        "Follow the suggestions to improve your password's security."
      ]}
      faqs={[
        {
          question: "Is it safe to type my password here?",
          answer: "Yes. This tool runs 100% in your browser using JavaScript. Your password is never sent to any server."
        },
        {
          question: "How is strength calculated?",
          answer: "We use a combination of length, character variety (uppercase, lowercase, numbers, symbols), and entropy calculations to estimate complexity."
        },
        {
          question: "What makes a strong password?",
          answer: "A strong password is long (12+ characters), uses a mix of character types, and avoids common words or patterns."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Password Strength", href: "/password-strength" }
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary-foreground" />
              Check Your Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Type a password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 text-lg h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {password && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-lg ${strength.color}`}>
                      {strength.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Estimated Crack Time: <span className="font-medium text-foreground">{crackTime}</span>
                    </span>
                  </div>
                  <Progress value={score} className={`h-3 ${strength.progressColor}`} />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-4 bg-muted rounded-none">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Good Practices
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className={password.length >= 12 ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
                        {password.length >= 12 ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-none border border-current" />}
                        12+ Characters
                      </li>
                      <li className={/[A-Z]/.test(password) ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
                        {/[A-Z]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-none border border-current" />}
                        Uppercase Letters
                      </li>
                      <li className={/[0-9]/.test(password) ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
                        {/[0-9]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-none border border-current" />}
                        Numbers
                      </li>
                      <li className={/[^a-zA-Z0-9]/.test(password) ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
                        {/[^a-zA-Z0-9]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-none border border-current" />}
                        Special Characters
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-muted rounded-none">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Suggestions
                    </h4>
                    {feedback.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {feedback.map((item, i) => (
                          <li key={i} className={`${item.type === 'error' ? 'text-destructive' : 'text-yellow-600'} flex items-center gap-1`}>
                            {item.type === 'error' ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Looking good!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
