"use client";

import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Download, User, Briefcase, GraduationCap, Star } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ToolPageContent from "@/components/ui/ToolPageContent";

export default function PortfolioCreatorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
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

  const generatePortfolioPDF = async () => {
    if (!portfolioData.fullName || !portfolioData.title) {
      alert('Please fill in your full name and professional title');
      return;
    }

    setIsGenerating(true);
    trackEvent('portfolio_generation_started', { template: portfolioData.template });

    try {
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
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Portfolio-${portfolioData.fullName.replace(/\s+/g, '-')}.pdf`;
      link.click();

        setTimeout(() => {
          try { URL.revokeObjectURL(url); } catch { }
        }, 500);

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
      console.error('Error generating portfolio:', error);
      alert('Error generating portfolio. Please try again.');
      trackEvent('portfolio_generation_failed', { error: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const toolConfig = {
    title: "Portfolio Creator",
    description: "Create professional PDF portfolios with customizable sections for experience, education, skills, and projects.",
    icon: React.createElement(Briefcase, { className: "w-8 h-8 text-blue-500" }),
    features: [
      "Professional portfolio templates",
      "Multiple customizable sections",
      "Experience and education tracking",
      "Skills and projects showcase",
      "Custom color schemes",
      "High-quality PDF output"
    ],
    relatedTools: ["/certificate-generator", "/invoice-generator", "/form-filler"]
  };

  return (
    <ToolPageContent
  toolName="Portfolio Creator"
  toolDescription="Design and export a professional portfolio or resume as a polished PDF. Add your experience, skills, education, and more."
  currentTool="portfolio-creator"
  steps={[
    "Enter your personal information (name, title, contact details).",
    "Add work experience, education, skills, projects, and certifications.",
    "Customize the template and colors.",
    "Click 'Generate Portfolio PDF' to download your document."
  ]}
  faqs={[
    { question: "Is the portfolio creator free?", answer: "Yes, you can create and download unlimited portfolios for free." },
    { question: "Can I add multiple jobs, schools, or projects?", answer: "Yes, you can add as many sections as you need." },
    { question: "Are my details stored?", answer: "No, all portfolio data is processed in your browser and never uploaded or saved." },
    { question: "Can I edit my portfolio later?", answer: "You can update the fields and regenerate your PDF at any time." },
    { question: "Does the PDF have watermarks?", answer: "No, your portfolio PDFs are watermark-free and print-ready." }
  ]}
  toolConfig={toolConfig}
>
      <div className="space-y-6">
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
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={portfolioData.email}
                onChange={(e) => updatePortfolioData('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={portfolioData.phone}
                onChange={(e) => updatePortfolioData('phone', e.target.value)}
                placeholder="+91 98765 43210"
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
                placeholder="Mumbai, India"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                value={portfolioData.summary}
                onChange={(e) => updatePortfolioData('summary', e.target.value)}
                placeholder="Brief overview of your professional background and key achievements..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Work Experience
              </div>
              <Button onClick={() => addSection('experience')} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.experience.map((exp, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Position</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateSectionItem('experience', index, 'position', e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateSectionItem('experience', index, 'company', e.target.value)}
                        placeholder="Tech Corp"
                      />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={exp.duration}
                        onChange={(e) => updateSectionItem('experience', index, 'duration', e.target.value)}
                        placeholder="Jan 2020 - Present"
                      />
                    </div>
                    <div className="flex items-end">
                      {portfolioData.experience.length > 1 && (
                        <Button
                          onClick={() => removeSection('experience', index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateSectionItem('experience', index, 'description', e.target.value)}
                      placeholder="Key responsibilities and achievements..."
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </div>
              <Button onClick={() => addSection('education')} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.education.map((edu, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateSectionItem('education', index, 'degree', e.target.value)}
                        placeholder="Bachelor of Technology"
                      />
                    </div>
                    <div>
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateSectionItem('education', index, 'institution', e.target.value)}
                        placeholder="University Name"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label>Year</Label>
                        <Input
                          value={edu.year}
                          onChange={(e) => updateSectionItem('education', index, 'year', e.target.value)}
                          placeholder="2020"
                        />
                      </div>
                      {portfolioData.education.length > 1 && (
                        <div className="flex items-end">
                          <Button
                            onClick={() => removeSection('education', index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Additional Details</Label>
                    <Input
                      value={edu.details}
                      onChange={(e) => updateSectionItem('education', index, 'details', e.target.value)}
                      placeholder="GPA, honors, relevant coursework..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Skills
              </div>
              <Button onClick={() => addSection('skills')} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Skill Category
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.skills.map((skill, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={skill.category}
                      onChange={(e) => updateSectionItem('skills', index, 'category', e.target.value)}
                      placeholder="Programming Languages"
                    />
                  </div>
                  <div>
                    <Label>Skills</Label>
                    <Input
                      value={skill.items}
                      onChange={(e) => updateSectionItem('skills', index, 'items', e.target.value)}
                      placeholder="JavaScript, Python, React, Node.js"
                    />
                  </div>
                  <div className="flex items-end">
                    {portfolioData.skills.length > 1 && (
                      <Button
                        onClick={() => removeSection('skills', index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Projects
              <Button onClick={() => addSection('projects')} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.projects.map((project, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Project Name</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => updateSectionItem('projects', index, 'name', e.target.value)}
                        placeholder="E-commerce Website"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label>Technologies</Label>
                        <Input
                          value={project.technologies}
                          onChange={(e) => updateSectionItem('projects', index, 'technologies', e.target.value)}
                          placeholder="React, Node.js, MongoDB"
                        />
                      </div>
                      {portfolioData.projects.length > 1 && (
                        <div className="flex items-end">
                          <Button
                            onClick={() => removeSection('projects', index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => updateSectionItem('projects', index, 'description', e.target.value)}
                        placeholder="Project description and key features..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Link (Optional)</Label>
                      <Input
                        value={project.link}
                        onChange={(e) => updateSectionItem('projects', index, 'link', e.target.value)}
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Styling Options */}
        <Card>
          <CardHeader>
            <CardTitle>Styling Options</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="template">Template</Label>
              <Select value={portfolioData.template} onValueChange={(value) => updatePortfolioData('template', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
    </ToolPageContent>
  );
}