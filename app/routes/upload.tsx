import { useState, type FormEvent } from "react";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";

export const meta = () => [
	{ title: "Resumind | Upload Resume" },
	{
		name: "description",
		content: "Upload your resume for ATS score and improvement tips.",
	},
	{
		name: "keywords",
		content: "AI Resume Analyzer, Resume Scanner, Resume Analysis",
	},
];

const Upload = () => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [statusText, setStatusText] = useState("");
	const [file, setFile] = useState<File | null>(null);

	const handleFileSelect = (file: File | null) => {
		setFile(file);
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget.closest("form");

		if (!form) return;

		const formData = new FormData(form);

		const companyName = formData.get("company-name");
		const jobTitle = formData.get("job-title");
		const jobDescription = formData.get("job-description");

		console.log({
			companyName,
			jobTitle,
			jobDescription,
			file,
		});
	};

	return (
		<main className=" bg-[url('/images/bg-main.svg')] bg-cover bg-center">
			<Navbar />

			<section className="main-section">
				<div className="page-heading max-w-4xl py-16">
					<h1>Smart feedback for your dream job</h1>
					{isProcessing ? (
						<>
							<h2>{statusText}</h2>
							<img
								src="/images/resume-scan.gif"
								alt="Scanning resume"
								className="w-full"
							/>
						</>
					) : (
						<h2>Drop your resume for an ATS score and improvement tips.</h2>
					)}
					{!isProcessing && (
						<form
							id="upload-form"
							onSubmit={handleSubmit}
							className="flex flex-col gap-4 mt-8"
						>
							<div className="form-div">
								<label htmlFor="company-name">Company Name</label>
								<input
									type="text"
									name="company-name"
									id="company-name"
									placeholder="Company Name"
								/>
							</div>

							<div className="form-div">
								<label htmlFor="job-title">Job Title</label>
								<input
									type="text"
									name="job-title"
									id="job-title"
									placeholder="Job Title"
								/>
							</div>

							<div className="form-div">
								<label htmlFor="job-description">Job Description</label>
								<textarea
									name="job-description"
									id="job-description"
									placeholder="Write a clear & concise job description with responsibilities & expectations..."
									rows={5}
								/>
							</div>

							<div className="form-div">
								<label htmlFor="uploader">Upload Resume</label>
								<FileUploader file={file} onFileSelect={handleFileSelect} />
							</div>

							<button type="submit" className="primary-button">
								Save & Analyze Resume
							</button>
						</form>
					)}
				</div>
			</section>
		</main>
	);
};

export default Upload;