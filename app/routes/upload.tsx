import { prepareInstructions } from "../../constants";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

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
	const { auth, isLoading, fs, ai, kv } = usePuterStore();
	const navigate = useNavigate();
	const [isProcessing, setIsProcessing] = useState(false);
	const [statusText, setStatusText] = useState("");
	const [file, setFile] = useState<File | null>(null);

	const handleFileSelect = (file: File | null) => {
		setFile(file);
	};

	const handleAnalyze = async ({
		companyName,
		jobTitle,
		jobDescription,
		file,
	}: {
		companyName: string;
		jobTitle: string;
		jobDescription: string;
		file: File;
	}) => {
		setIsProcessing(true);

		setStatusText("Uploading your resume...");
		const uploadedFile = await fs.upload([file]);
		if (!uploadedFile) return setStatusText("Error: Failed to upload file.");

		setStatusText("Converting to image...");
		const imageFile = await convertPdfToImage(file);
		if (!imageFile.file)
			return setStatusText("Error: Failed to convert PDF to image.");

		setStatusText("Uploading the image...");
		const uploadedImage = await fs.upload([imageFile.file]);
		if (!uploadedImage) return setStatusText("Error: Failed to upload image.");

		setStatusText("Preparing Data...");
		const uuid = generateUUID();
		const data = {
			id: uuid,
			resumePath: uploadedFile.path,
			imagePath: uploadedImage.path,
			companyName,
			jobTitle,
			jobDescription,
			feedback: "",
		};
		await kv.set(`resume:${uuid}`, JSON.stringify(data));

		setStatusText("Analyzing your resume...");

		const feedback = await ai.feedback(
			uploadedFile.path,
			prepareInstructions({ jobTitle, jobDescription })
		);
		if (!feedback) return setStatusText("Error: Failed to analyze resume.");

		const feedbackText =
			typeof feedback.message.content === "string"
				? feedback.message.content
				: feedback.message.content[0].text;

		data.feedback = JSON.parse(feedbackText);
		await kv.set(`resume:${uuid}`, JSON.stringify(data));

		setStatusText("Analysis complete, redirecting...");
		console.log(data);
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget.closest("form");

		if (!form) return;

		const formData = new FormData(form);

		const companyName = formData.get("company-name") as string;
		const jobTitle = formData.get("job-title") as string;
		const jobDescription = formData.get("job-description") as string;

		if (!file) return;

		handleAnalyze({ companyName, jobTitle, jobDescription, file });
	};

	return (
		<main className=" bg-[url('/images/bg-main.svg')] bg-cover bg-center">
			<Navbar />

			<section className="main-section">
				<div className="page-heading max-w-4xl py-16">
					<h1>Smart feedback for your dream job</h1>
					{isProcessing ? (
						<div className="flex flex-col items-center gap-2">
							<h2 className="text-center">{statusText}</h2>
							<div className="w-150 h-150 flex items-center justify-center">
								<img
									src="/images/resume-scan-2.gif"
									alt="Scanning resume"
									className="w-full h-full object-contain"
								/>
							</div>
						</div>
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
