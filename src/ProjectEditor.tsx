import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";

export default function ProjectEditor({ project, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    image: "",
    tag: "",
    year: "",
    size: "small"
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        content: project.content || "",
        image: project.image || "",
        tag: project.tag || "",
        year: project.year || "",
        size: project.size || "small"
      });
    }
  }, [project]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload,
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
          throw new Error("Your session has expired. Please log in again.");
        }
        const errorText = await res.text();
        console.error("Upload failed with status:", res.status, errorText);
        throw new Error("Upload failed: " + res.statusText);
      }

      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
      }
    } catch (err: any) {
      console.error("Upload failed", err);
      alert("Failed to upload image: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Auto-intercept pasted images in rich text (Base64) to prevent database timeouts
    if (formData.content.includes("data:image/")) {
      setIsUploading(true);
      let updatedContent = formData.content;
      
      const base64Regex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
      let match;
      const matches: string[] = [];
      
      while ((match = base64Regex.exec(updatedContent)) !== null) {
        matches.push(match[1]);
      }
      
      try {
        for (const base64Str of matches) {
          const res = await fetch(base64Str);
          const blob = await res.blob();
          
          const formDataUpload = new FormData();
          formDataUpload.append("image", blob, `pasted-image-${Date.now()}.png`);
          
          const token = localStorage.getItem('adminToken');
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
            body: formDataUpload,
          });
          
          if (!uploadRes.ok) throw new Error("Upload failed");
          const data = await uploadRes.json();
          
          if (data.url) {
            updatedContent = updatedContent.replace(base64Str, data.url);
          }
        }
        onSave({ ...formData, content: updatedContent });
      } catch (err: any) {
        console.error("Failed to process inline images", err);
        alert("Failed to upload pasted images: " + err.message);
      } finally {
        setIsUploading(false);
      }
    } else {
      onSave(formData);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div className="min-h-screen bg-dark text-white p-8 selection:bg-accent selection:text-dark">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <button onClick={onCancel} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-serif italic">
              {project ? "Edit Project" : "New Project"}
            </h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="flex items-center gap-2 bg-accent text-dark px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Project
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-surface/40 border border-white/5 p-8 rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Project Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                placeholder="e.g. Finova Dashboard"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Featured Image</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                    placeholder="Image URL or upload..."
                  />
                </div>
                <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 flex items-center justify-center transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                </label>
              </div>
              {formData.image && (
                <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-white/10">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Tag / Category</label>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                required
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                placeholder="e.g. Fintech"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Year</label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                placeholder="e.g. 2024"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Short Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="Brief summary of the project..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Grid Size (Optional)</label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              >
                <option value="small">Small</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Full Case Study Content</label>
            <div className="bg-white text-black rounded-xl overflow-hidden">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={modules}
                className="h-96 pb-12"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

