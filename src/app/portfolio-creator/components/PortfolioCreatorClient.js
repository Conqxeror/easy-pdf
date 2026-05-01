"use client";

import React, { useState } from "react";
import { loadPdfLib } from "@/lib/pdfjsWorker";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Download, User, Briefcase, GraduationCap, Star } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { toast } from "sonner";

export default function PortfolioCreatorClient() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [portfolioData, setPortfolioData] = useState({
    // Personal Information
    fullName: '',
    title: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    summary: '',

    // Experience
    experience: [
      {
        position: '',
        company: '',
        duration: '',
        description: ''
      }
    ],

    // Education
    education: [
      {
        degree: '',
        institution: '',
        year: '',
        details: ''
      }
    ],

    // Skills
    skills: [
      {
        category: '',
        items: ''
      }
    ],

    // Projects
    projects: [
      {
        name: '',
        description: '',
        technologies: '',
        link: ''
      }
    ],

    // Certifications
    certifications: [
      {
        name: '',
        issuer: '',
        year: '',
        id: ''
      }
    ],

    // Template and styling
    template: 'modern',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af'
  });

  const updatePortfolioData = (field, value) => {
    setPortfolioData(prev => ({ ...prev, [field]: value }));
  };

  const addSection = (section) => {
    const newItem = {
      experience: { position: '', company: '', duration: '', description: '' },
      education: { degree: '', institution: '', year: '', details: '' },
      skills: { category: '', items: '' },
      projects: { name: '', description: '', technologies: '', link: '' },
      certifications: { name: '', issuer: '', year: '', id: '' }
    };

    setPortfolioData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem[section]]
    }));
  };

  const removeSection = (section, index) => {
    if (portfolioData[section].length > 1) {
      setPortfolioData(prev => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index)
      }));
    }
  };

  const updateSectionItem = (section, index, field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Section-specific helper functions
  const addExperience = () => addSection('experience');
  const removeExperience = (index) => removeSection('experience', index);
  const updateExperience = (index, field, value) => updateSectionItem('experience', index, field, value);

  const addEducation = () => addSection('education');
  const removeEducation = (index) => removeSection('education', index);
  const updateEducation = (index, field, value) => updateSectionItem('education', index, field, value);

  const addSkill = () => addSection('skills');
  const removeSkill = (index) => removeSection('skills', index);
  const updateSkill = (index, field, value) => updateSectionItem('skills', index, field, value);

  const addProject = () => addSection('projects');
  const removeProject = (index) => removeSection('projects', index);
  const updateProject = (index, field, value) => updateSectionItem('projects', index, field, value);

  const generatePortfolioPDF = async () => {
    if (!portfolioData.fullName || !portfolioData.title) {
      setError('Please fill in your full name and professional title.');
      return;
    }

    setError("");
    setIsGenerating(true);
    trackEvent('portfolio_generation_started', { template: portfolioData.template });

    try {
      const { PDFDocument, rgb, StandardFonts } = await loadPdfLib();
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      const { width, height } = page.getSize();
      let yPosition = height - 50;

      // Convert hex colors to RGB
      const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
      };

      const primaryColor = hexToRgb(portfolioData.primaryColor);
      const secondaryColor = hexToRgb(portfolioData.secondaryColor);

      // Header Section
      page.drawRectangle({
        x: 0,
        y: height - 120,
        width: width,
        height: 120,
        color: primaryColor
      });

      // Name
      const nameSize = Math.min(28, 400 / portfolioData.fullName.length);
      page.drawText(portfolioData.fullName, {
        x: 50,
        y: height - 70,
        size: nameSize,
        font: boldFont,
        color: rgb(1, 1, 1)
      });

      // Title
      page.drawText(portfolioData.title, {
        x: 50,
        y: height - 95,
        size: 16,
        font: italicFont,
        color: rgb(0.9, 0.9, 0.9)
      });

      yPosition = height - 140;

      // Contact Information
      const contactInfo = [
        portfolioData.email && `Email: ${portfolioData.email}`,
        portfolioData.phone && `Phone: ${portfolioData.phone}`,
        portfolioData.website && `Website: ${portfolioData.website}`,
        portfolioData.location && `Location: ${portfolioData.location}`
      ].filter(Boolean);

      contactInfo.forEach(info => {
        page.drawText(info, {
          x: 50,
          y: yPosition,
          size: 10,
          font,
          color: rgb(0.4, 0.4, 0.4)
        });
        yPosition -= 15;
      });

      yPosition -= 20;

      // Summary Section
      if (portfolioData.summary) {
        page.drawText('PROFESSIONAL SUMMARY', {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: primaryColor
        });

        page.drawLine({
          start: { x: 50, y: yPosition - 5 },
          end: { x: width - 50, y: yPosition - 5 },
          thickness: 2,
          color: secondaryColor
        });

        yPosition -= 25;

        const summaryLines = portfolioData.summary.match(/.{1,85}/g) || [portfolioData.summary];
        summaryLines.forEach(line => {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 11,
            font,
            color: rgb(0.2, 0.2, 0.2)
          });
          yPosition -= 15;
        });

        yPosition -= 20;
      }

      // Experience Section
      if (portfolioData.experience.some(exp => exp.position)) {
        page.drawText('WORK EXPERIENCE', {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: primaryColor
        });

        page.drawLine({
          start: { x: 50, y: yPosition - 5 },
          end: { x: width - 50, y: yPosition - 5 },
          thickness: 2,
          color: secondaryColor
        });

        yPosition -= 25;

        portfolioData.experience.forEach(exp => {
          if (exp.position) {
            // Position and Company
            page.drawText(`${exp.position}${exp.company ? ` at ${exp.company}` : ''}`, {
              x: 50,
              y: yPosition,
              size: 12,
              font: boldFont,
              color: rgb(0, 0, 0)
            });

            if (exp.duration) {
              page.drawText(exp.duration, {
                x: width - 150,
                y: yPosition,
                size: 10,
                font: italicFont,
                color: rgb(0.5, 0.5, 0.5)
              });
            }

            yPosition -= 20;

            if (exp.description) {
              const descLines = exp.description.match(/.{1,80}/g) || [exp.description];
              descLines.forEach(line => {
                page.drawText(`• ${line}`, {
                  x: 60,
                  y: yPosition,
                  size: 10,
                  font,
                  color: rgb(0.3, 0.3, 0.3)
                });
                yPosition -= 12;
              });
            }

            yPosition -= 15;
          }
        });

        yPosition -= 10;
      }

      // Check if we need a new page
      if (yPosition < 200) {
        // const newPage = pdfDoc.addPage([595.28, 841.89]); // Unused variable
        yPosition = height - 50;
      }

      // Education Section
      if (portfolioData.education.some(edu => edu.degree)) {
        page.drawText('EDUCATION', {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: primaryColor
        });

        page.drawLine({
          start: { x: 50, y: yPosition - 5 },
          end: { x: width - 50, y: yPosition - 5 },
          thickness: 2,
          color: secondaryColor
        });

        yPosition -= 25;

        portfolioData.education.forEach(edu => {
          if (edu.degree) {
            page.drawText(`${edu.degree}${edu.institution ? ` - ${edu.institution}` : ''}`, {
              x: 50,
              y: yPosition,
              size: 12,
              font: boldFont,
              color: rgb(0, 0, 0)
            });

            if (edu.year) {
              page.drawText(edu.year, {
                x: width - 100,
                y: yPosition,
                size: 10,
                font: italicFont,
                color: rgb(0.5, 0.5, 0.5)
              });
            }

            yPosition -= 15;

            if (edu.details) {
              page.drawText(edu.details, {
                x: 60,
                y: yPosition,
                size: 10,
                font,
                color: rgb(0.3, 0.3, 0.3)
              });
              yPosition -= 12;
            }

            yPosition -= 10;
          }
        });

        yPosition -= 10;
      }

      // Skills Section
      if (portfolioData.skills.some(skill => skill.category)) {
        page.drawText('SKILLS', {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: primaryColor
        });

        page.drawLine({
          start: { x: 50, y: yPosition - 5 },
          end: { x: width - 50, y: yPosition - 5 },
          thickness: 2,
          color: secondaryColor
        });

        yPosition -= 25;

        portfolioData.skills.forEach(skill => {
          if (skill.category) {
            page.drawText(`${skill.category}:`, {
              x: 50,
              y: yPosition,
              size: 11,
              font: boldFont,
              color: rgb(0, 0, 0)
            });

            if (skill.items) {
              page.drawText(skill.items, {
                x: 150,
                y: yPosition,
                size: 10,
                font,
                color: rgb(0.3, 0.3, 0.3)
              });
            }

            yPosition -= 15;
          }
        });

        yPosition -= 10;
      }

      // Projects Section
      if (portfolioData.projects.some(proj => proj.name)) {
        page.drawText('PROJECTS', {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: primaryColor
        });

        page.drawLine({
          start: { x: 50, y: yPosition - 5 },
          end: { x: width - 50, y: yPosition - 5 },
          thickness: 2,
          color: secondaryColor
        });

        yPosition -= 25;

        portfolioData.projects.forEach(proj => {
          if (proj.name) {
            page.drawText(proj.name, {
              x: 50,
              y: yPosition,
              size: 12,
              font: boldFont,
              color: rgb(0, 0, 0)
            });

            yPosition -= 15;

            if (proj.description) {
              const projLines = proj.description.match(/.{1,80}/g) || [proj.description];
              projLines.forEach(line => {
                page.drawText(line, {
                  x: 60,
                  y: yPosition,
                  size: 10,
                  font,
                  color: rgb(0.3, 0.3, 0.3)
                });
                yPosition -= 12;
              });
            }

            if (proj.technologies) {
              page.drawText(`Technologies: ${proj.technologies}`, {
                x: 60,
                y: yPosition,
                size: 9,
                font: italicFont,
                color: rgb(0.5, 0.5, 0.5)
              });
              yPosition -= 12;
            }

            if (proj.link) {
              page.drawText(`Link: ${proj.link}`, {
                x: 60,
                y: yPosition,
                size: 9,
                font,
                color: secondaryColor
              });
              yPosition -= 12;
            }

            yPosition -= 10;
          }
        });
      }

      // Certifications Section
      if (portfolioData.certifications.some(cert => cert.name)) {
        page.drawText('CERTIFICATIONS', {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: primaryColor
        });

        page.drawLine({
          start: { x: 50, y: yPosition - 5 },
          end: { x: width - 50, y: yPosition - 5 },
          thickness: 2,
          color: secondaryColor
        });

        yPosition -= 25;

        portfolioData.certifications.forEach(cert => {
          if (cert.name) {
            page.drawText(`${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`, {
              x: 50,
              y: yPosition,
              size: 11,
              font: boldFont,
              color: rgb(0, 0, 0)
            });

            if (cert.year) {
              page.drawText(cert.year, {
                x: width - 100,
                y: yPosition,
                size: 10,
                font: italicFont,
                color: rgb(0.5, 0.5, 0.5)
              });
            }

            yPosition -= 12;

            if (cert.id) {
              page.drawText(`ID: ${cert.id}`, {
                x: 60,
                y: yPosition,
                size: 9,
                font,
                color: rgb(0.5, 0.5, 0.5)
              });
              yPosition -= 10;
            }

            yPosition -= 5;
          }
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      let url;
      try {
        try { url = safeCreateObjectURL(blob); } catch { toast.error('Failed to create download link'); url = null; }

        const link = document.createElement('a');
        link.href = url;
        // sanitize filename: replace spaces and remove unsafe chars
        const safeName = (portfolioData.fullName || 'Portfolio')
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9\-_.]/g, '');
        link.download = `Portfolio-${safeName}.pdf`;
        // append to DOM to ensure click works in all browsers
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
          try { safeRevokeObjectURL(url); } catch { }
        }, 500);
      } catch (err) {
        try { safeRevokeObjectURL(url); } catch { }
        throw err;
      }

      trackEvent('portfolio_generated_successfully', {
        template: portfolioData.template,
        sections: {
          experience: portfolioData.experience.filter(exp => exp.position).length,
          education: portfolioData.education.filter(edu => edu.degree).length,
          projects: portfolioData.projects.filter(proj => proj.name).length,
          skills: portfolioData.skills.filter(skill => skill.category).length
        }
      });

    } catch (error) {
      setError('Error generating the portfolio PDF. Please try again.');
      trackEvent('portfolio_generation_failed', { error: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ToolPageLayout
      title="Portfolio Creator"
      subtitle="Create professional portfolios for your career, education, or personal projects with our free online tool."
      toolName="Portfolio Creator"
      toolDescription="Create professional portfolios for your career, education, or personal projects with our free online tool."
      steps={[
        "Fill in your personal information including name, title, and contact details.",
        "Add your professional experience, education, skills, and projects.",
        "Customize the appearance with your preferred colors and fonts.",
        "Click the 'Generate Portfolio PDF' button to create your document.",
        "Download your professionally designed portfolio as a PDF file."
      ]}
      faqs={[
        {
          question: "Is it free to create a portfolio?",
          answer:
            "Yes, our Portfolio Creator tool is completely free to use. You can create as many portfolios as you need without any hidden costs or limitations."
        },
        {
          question: "Are my portfolios secure and private?",
          answer:
            "Absolutely. Your privacy is our top priority. All portfolio generation happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
        },
        {
          question: "Can I customize the portfolio template?",
          answer:
            "Yes, you can customize various aspects of the portfolio including colors, fonts, and sections. You can also add your company logo for a professional appearance."
        },
        {
          question: "What file formats are supported?",
          answer:
            "Our tool generates portfolios as PDF files, which are widely supported and can be easily shared or printed."
        },
        {
          question: "Is there a limit to how much information I can add?",
          answer:
            "No, you can add as much information as needed to your portfolio. The tool will automatically adjust the layout to accommodate your content."
        }
      ]}
      currentTool="portfolio-creator"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Portfolio Creator', href: '/portfolio-creator' }
      ]}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground dark:text-foreground mb-2">
            Portfolio Creator
          </h2>
          <p className="text-foreground dark:text-foreground">
            Create professional portfolios for your career, education, or personal projects
          </p>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={portfolioData.fullName}
                onChange={(e) => updatePortfolioData('fullName', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Professional Title *</Label>
              <Input
                id="title"
                value={portfolioData.title}
                onChange={(e) => updatePortfolioData('title', e.target.value)}
                placeholder="Software Engineer"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                value={portfolioData.summary}
                onChange={(e) => updatePortfolioData('summary', e.target.value)}
                placeholder="A brief summary of your professional background and goals"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={portfolioData.email}
                onChange={(e) => updatePortfolioData('email', e.target.value)}
                placeholder="support@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={portfolioData.phone}
                onChange={(e) => updatePortfolioData('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={portfolioData.website}
                onChange={(e) => updatePortfolioData('website', e.target.value)}
                placeholder="https://johndoe.com"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={portfolioData.location}
                onChange={(e) => updatePortfolioData('location', e.target.value)}
                placeholder="New York, NY"
              />
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Experience
              </span>
              <Button onClick={addExperience} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioData.experience.map((exp, index) => (
              <div key={index} className="mb-6 p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold">Experience #{index + 1}</h3>
                  <Button
                    onClick={() => removeExperience(index)}
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`company-${index}`}>Company *</Label>
                    <Input
                      id={`company-${index}`}
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="Company Name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`position-${index}`}>Position *</Label>
                    <Input
                      id={`position-${index}`}
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      placeholder="Job Title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`duration-${index}`}>Duration</Label>
                    <Input
                      id={`duration-${index}`}
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                      placeholder="Jan 2020 - Present"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      placeholder="Describe your responsibilities and achievements"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </span>
              <Button onClick={addEducation} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioData.education.map((edu, index) => (
              <div key={index} className="mb-6 p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold">Education #{index + 1}</h3>
                  <Button
                    onClick={() => removeEducation(index)}
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`degree-${index}`}>Degree *</Label>
                    <Input
                      id={`degree-${index}`}
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="Bachelor of Science"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`institution-${index}`}>Institution *</Label>
                    <Input
                      id={`institution-${index}`}
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      placeholder="University Name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`year-${index}`}>Year</Label>
                    <Input
                      id={`year-${index}`}
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      placeholder="2020"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`details-${index}`}>Details</Label>
                    <Textarea
                      id={`details-${index}`}
                      value={edu.details}
                      onChange={(e) => updateEducation(index, 'details', e.target.value)}
                      placeholder="Additional details about your education"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Skills</span>
              <Button onClick={addSkill} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioData.skills.map((skill, index) => (
              <div key={index} className="mb-4 p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold">Skill #{index + 1}</h3>
                  <Button
                    onClick={() => removeSkill(index)}
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`category-${index}`}>Category *</Label>
                    <Input
                      id={`category-${index}`}
                      value={skill.category}
                      onChange={(e) => updateSkill(index, 'category', e.target.value)}
                      placeholder="Technical Skills"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`items-${index}`}>Skills *</Label>
                    <Textarea
                      id={`items-${index}`}
                      value={skill.items}
                      onChange={(e) => updateSkill(index, 'items', e.target.value)}
                      placeholder="JavaScript, React, Node.js"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Projects
              </span>
              <Button onClick={addProject} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioData.projects.map((project, index) => (
              <div key={index} className="mb-6 p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold">Project #{index + 1}</h3>
                  <Button
                    onClick={() => removeProject(index)}
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${index}`}>Project Name *</Label>
                    <Input
                      id={`name-${index}`}
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      placeholder="Project Name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`technologies-${index}`}>Technologies</Label>
                    <Input
                      id={`technologies-${index}`}
                      value={project.technologies}
                      onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`description-${index}`}>Description *</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      placeholder="Describe the project and your role in it"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Customization */}
        <Card>
          <CardHeader>
            <CardTitle>Customization</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Input
                id="primaryColor"
                type="color"
                value={portfolioData.primaryColor}
                onChange={(e) => updatePortfolioData('primaryColor', e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <Input
                id="secondaryColor"
                type="color"
                value={portfolioData.secondaryColor}
                onChange={(e) => updatePortfolioData('secondaryColor', e.target.value)}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={generatePortfolioPDF}
            disabled={isGenerating || !portfolioData.fullName || !portfolioData.title}
            size="lg"
            className="bg-background hover:bg-background"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Portfolio...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Portfolio PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  );
}
