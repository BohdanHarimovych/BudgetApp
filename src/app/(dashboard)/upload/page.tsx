import { Metadata } from "next";
import CSVUpload from "@/components/upload/csv-upload";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Upload Transactions",
  description: "Upload your transaction data from CSV files",
};

export default function UploadPage() {
  return (
    <div className="container max-w-screen-lg mx-auto py-6 px-4 md:px-6">
      <PageHeader
        title="Upload Transactions"
        description="Import your transaction data from CSV files"
      />
      
      <div className="mt-8">
        <CSVUpload />
      </div>
    </div>
  );
}
