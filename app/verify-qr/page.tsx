"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function QRVerificationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  };


  const analyzeQR = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/analyze-qr",
        {
          method: "POST",
          body: formData,
        }
      );


      const data = await response.json();

      setResult(data);

    } catch (error) {

      setResult({
        success: false,
        message: "Server connection failed",
      });

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="min-h-screen bg-black text-white p-8">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >

        <div className="flex items-center gap-3 mb-8">

          <QrCode
            className="text-cyan-400"
            size={40}
          />

          <h1 className="text-3xl font-bold">
            QR Code Safety Scanner
          </h1>

        </div>


        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">


          <label className="
            flex flex-col items-center justify-center
            border-2 border-dashed
            border-cyan-500
            rounded-xl
            p-8
            cursor-pointer
          ">

            <Upload size={40}
              className="text-cyan-400 mb-3"
            />

            <span>
              Upload QR Code Image
            </span>


            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

          </label>


          {
            preview && (

              <img
                src={preview}
                alt="QR Preview"
                className="
                mt-6
                mx-auto
                max-h-64
                rounded-lg
                "
              />

            )
          }



          <button
            onClick={analyzeQR}
            disabled={!file || loading}
            className="
            mt-6
            w-full
            bg-cyan-600
            hover:bg-cyan-700
            disabled:bg-gray-700
            py-3
            rounded-lg
            font-semibold
            "
          >

            {
              loading ? (
                <span className="flex justify-center gap-2">
                  <Loader2 className="animate-spin"/>
                  Scanning...
                </span>
              ) : (
                "Analyze QR Code"
              )
            }

          </button>


        </div>


        {
          result && (

          <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            className="
            mt-8
            bg-gray-900
            border
            border-gray-700
            rounded-xl
            p-6
            "
          >

            {
              result.success ? (

                <>

                <div className="flex items-center gap-3">

                {
                  result.prediction === "SAFE"
                  ?
                  <ShieldCheck
                    className="text-green-400"
                  />
                  :
                  <AlertTriangle
                    className="text-red-400"
                  />
                }


                <h2 className="text-xl font-bold">
                  {result.prediction}
                </h2>

                </div>


                <div className="mt-5 space-y-2">

                  <p>
                    Confidence:
                    <b> {result.confidence}%</b>
                  </p>

                  <p>
                    Threat Score:
                    <b> {result.threat_score}</b>
                  </p>

                  <p>
                    Risk:
                    <b> {result.risk}</b>
                  </p>


                  <p>
                    QR Content:
                    <b>
                      {" "}
                      {result.decoded_content}
                    </b>
                  </p>


                </div>


                <div className="mt-5">

                  <h3 className="font-bold">
                    Reasons
                  </h3>

                  <ul className="list-disc ml-5">

                  {
                    result.reasons?.map(
                      (
                        reason:string,
                        index:number
                      )=>(
                        <li key={index}>
                          {reason}
                        </li>
                      )
                    )
                  }

                  </ul>

                </div>


                <div className="mt-5">

                  <h3 className="font-bold">
                    Recommendation
                  </h3>

                  <p>
                    {result.recommendation}
                  </p>

                </div>


                </>

              )
              :
              (

                <p className="text-red-400">
                  {result.message}
                </p>

              )
            }


          </motion.div>

          )
        }


      </motion.div>

    </div>
  );
}