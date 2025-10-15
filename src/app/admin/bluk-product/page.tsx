// "use client";
// import { useState } from "react";
// import { Icon } from "@iconify/react";
// import { db } from "@/lib/firebase";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import Papa, { ParseResult } from "papaparse";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { clearAllProductCaches } from "@/lib/cacheUtils";

// interface Product {
//   itemName: string;
//   amount: number;
//   category: string;
//   subcategory: string;
//   brand: string;
//   imageURL: string;
//   slug: string;
//   sku: string;
//   // Optional properties that may exist in uploaded JSON
//   status?: string;
//   inStock?: boolean;
//   stockQuantity?: number;
//   features?: string[];
//   tags?: string[];
//   images?: string[];
//   // Processing flags
//   needsImageProcessing?: boolean;
//   originalImageURLs?: string[];
// }

// interface UploadResult {
//   success: number;
//   failed: number;
//   errors: Array<{ product: Product; error: string }>;
// }

// export default function UploadBulkProducts() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [uploading, setUploading] = useState(false);
//   const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
//   const [dragOver, setDragOver] = useState(false);
//   const [showPreview, setShowPreview] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [lastFileType, setLastFileType] = useState<string>("");
//   const [currentUploadStatus, setCurrentUploadStatus] = useState("");

//   // Function to download image from URL and convert to File


// // const downloadImageFromURL = async (url: string, filename: string): Promise<File> => {
// //   try {
// //     const response = await fetch(url);
// //     if (!response.ok) {
// //       throw new Error(`Failed to download image: ${response.status}`);
// //     }

// //     const blob = await response.blob();

// //     // Check size
// //     if (blob.size === 0) {
// //       throw new Error(`Downloaded file is empty for URL: ${url}`);
// //     }

// //     // Ensure it's an image
// //     if (!blob.type.startsWith("image/")) {
// //       throw new Error(`Downloaded content is not an image: ${blob.type}`);
// //     }

// //     return new File([blob], filename, { type: blob.type });
// //   } catch (error) {
// //     console.error(`Failed to download image from ${url}:`, error);
// //     throw error;
// //   }
// // };









//   const downloadImageFromURL = async (url: string, filename: string): Promise<File> => {
//     try {
//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error(`Failed to download image: ${response.status}`);
//       }
      
//       const blob = await response.blob();
      
//       // Ensure it's an image
//       if (!blob.type.startsWith('image/')) {
//         throw new Error('Downloaded content is not an image');
//       }
      
//       return new File([blob], filename, { type: blob.type });
//     } catch (error) {
//       console.error(`Failed to download image from ${url}:`, error);
//       throw error;
//     }
//   };

//   // Image compression function (same as single product)
//  const compressImage = (file: File): Promise<File> => {
//   return new Promise((resolve) => {
//     const img = new Image();
//     img.crossOrigin = "anonymous"; // ✅ avoid CORS-tainted canvas

//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");
//       if (!ctx) return resolve(file);

//       const maxSize = 800;
//       let { width, height } = img;

//       if (width > height && width > maxSize) {
//         height = (height * maxSize) / width;
//         width = maxSize;
//       } else if (height > maxSize) {
//         width = (width * maxSize) / height;
//         height = maxSize;
//       }

//       canvas.width = width;
//       canvas.height = height;
//       ctx.drawImage(img, 0, 0, width, height);

//       canvas.toBlob(
//         (blob) => {
//           if (blob) {
//             resolve(new File([blob], file.name, { type: blob.type || file.type }));
//           } else {
//             resolve(file); // ✅ fallback
//           }
//         },
//         file.type, // ✅ preserve format (png, webp, jpg)
//         0.85
//       );
//     };

//     img.onerror = () => resolve(file); // ✅ fallback to original
//     img.src = URL.createObjectURL(file);
//   });
// };



//   // Cloudinary upload function (same as single product)
//   const uploadToCloudinary = async (image: File): Promise<string> => {
//     const formData = new FormData();
//     formData.append("file", image);
//     formData.append(
//       "upload_preset",
//       process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
//     );
//     formData.append(
//       "cloud_name",
//       process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
//     );

//     try {
//       const response = await fetch(
//         `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Upload failed: ${response.statusText}`);
//       }

//       const data = await response.json();
//       return data.secure_url;
//     } catch (error) {
//       console.error(`Cloudinary upload failed:`, error);
//       throw error;
//     }
//   };


//   // ✅ Retry helper for Cloudinary uploads
// const retryUpload = async (file: File, retries = 3): Promise<string> => {
//   let lastError;
//   for (let i = 0; i < retries; i++) {
//     try {
//       return await uploadToCloudinary(file);
//     } catch (err) {
//       console.warn(`Cloudinary upload attempt ${i + 1} failed`, err);
//       lastError = err;
//     }
//   }
//   throw new Error("Upload failed after retries: " + lastError);
// };


//   const validateProduct = (product: any): string[] => {
//     const errors: string[] = [];
//     const requiredFields = [
//       "itemName",
//       "amount",
//       "category",
//       "subcategory",
//       "brand",
//       "imageURL",
//       "sku",
//     ];

//     requiredFields.forEach((field) => {
//       const value = product[field];
//       if (
//         !value ||
//         value === "" ||
//         (typeof value === "string" && value.trim() === "")
//       ) {
//         errors.push(`Missing ${field}`);
//       }
//     });

//     if (
//       typeof product.amount !== "number" ||
//       product.amount < 0 ||
//       isNaN(product.amount)
//     ) {
//       errors.push("Amount must be a positive number");
//     }

//     if (product.imageURL && !isValidURL(product.imageURL.toString().trim())) {
//       errors.push("Invalid image URL");
//     }

//     if (product.sku && typeof product.sku === "string") {
//       const sku = product.sku.trim();
//       if (sku.length < 3) {
//         errors.push("SKU must be at least 3 characters long");
//       }
//       if (!/^[A-Za-z0-9\-_]+$/.test(sku)) {
//         errors.push("SKU can only contain letters, numbers, hyphens, and underscores");
//       }
//     }

//     if (product.stockQuantity !== undefined) {
//       if (typeof product.stockQuantity !== "number" || product.stockQuantity < 0) {
//         errors.push("Stock quantity must be a non-negative number");
//       }
//     }

//     return errors;
//   };

//   const isValidURL = (string: string) => {
//     try {
//       new URL(string);
//       return true;
//     } catch (_) {
//       return false;
//     }
//   };

//   const generateSKU = (product: any, index: number): string => {
//     if (product.sku && typeof product.sku === "string" && product.sku.trim()) {
//       return product.sku.trim().toUpperCase();
//     }
    
//     const brand = (product.brand || "GEN").substring(0, 3).toUpperCase();
//     const category = (product.category || "CAT").substring(0, 3).toUpperCase();
//     const timestamp = Date.now().toString().slice(-4);
//     const indexStr = String(index + 1).padStart(3, '0');
    
//     return `${brand}-${category}-${timestamp}${indexStr}`;
//   };

//   const parseCSVData = async (file: File): Promise<Product[]> => {
//     const text = await file.text();

//     return new Promise((resolve, reject) => {
//       Papa.parse(text, {
//         header: true,
//         dynamicTyping: true,
//         skipEmptyLines: true,
//         delimitersToGuess: [",", "\t", "|", ";"],
//         complete: (results: ParseResult<any>) => {
//           try {
//             const products: Product[] = results.data.map(
//               (row: any, index: number) => {
//                 const cleanRow: any = {};
//                 Object.keys(row).forEach((key) => {
//                   const cleanKey = key.trim();
//                   cleanRow[cleanKey] = row[key];
//                 });

//                 const mapField = (possibleNames: string[]) => {
//                   for (const name of possibleNames) {
//                     if (
//                       cleanRow[name] !== undefined &&
//                       cleanRow[name] !== null &&
//                       cleanRow[name] !== ""
//                     ) {
//                       return cleanRow[name];
//                     }
//                   }
//                   return "";
//                 };

//                 const parseArrayField = (field: any): string[] => {
//                   if (Array.isArray(field)) return field;
//                   if (typeof field === "string" && field.trim()) {
//                     return field
//                       .split(",")
//                       .map((item) => item.trim())
//                       .filter((item) => item);
//                   }
//                   return [];
//                 };

//                 const imageURL = mapField([
//                   "imageURL",
//                   "image_url",
//                   "image",
//                   "Image URL",
//                   "Image",
//                   "photo",
//                 ]);

//                 const additionalImages = parseArrayField(
//                   mapField(["images", "Images", "image_urls", "Image URLs"])
//                 );

//                 // Check if we need to process images from external URLs
//                 const needsImageProcessing = !imageURL.includes('res.cloudinary.com');
//                 const allImageURLs = [imageURL, ...additionalImages].filter(Boolean);

//                 const productData = {
//                   itemName: mapField([
//                     "itemName",
//                     "name",
//                     "product_name",
//                     "title",
//                     "Item Name",
//                     "Product Name",
//                   ]),
//                   amount: parseFloat(
//                     mapField([
//                       "amount",
//                       "price",
//                       "cost",
//                       "Amount",
//                       "Price",
//                       "Cost",
//                     ]) || "0"
//                   ),
//                   category: mapField(["category", "Category"]),
//                   subcategory: mapField([
//                     "subcategory",
//                     "sub_category",
//                     "Subcategory",
//                     "Sub Category",
//                   ]),
//                   brand: mapField([
//                     "brand",
//                     "Brand",
//                     "manufacturer",
//                     "Manufacturer",
//                   ]),
//                   imageURL: imageURL,
//                   slug: mapField(["slug", "Slug"]) || "",
//                   sku: mapField([
//                     "sku",
//                     "SKU",
//                     "productCode",
//                     "product_code",
//                     "itemCode",
//                     "item_code",
//                     "Product Code",
//                     "Item Code"
//                   ]) || "",
//                   status: mapField([
//                     "status",
//                     "Status",
//                     "availability",
//                     "Availability",
//                   ]),
//                   stockQuantity: parseInt(
//                     mapField([
//                       "stockQuantity",
//                       "stock_quantity",
//                       "stock",
//                       "quantity",
//                       "qty",
//                       "Stock Quantity",
//                       "Stock",
//                       "Quantity"
//                     ]) || "0"
//                   ),
//                   inStock: mapField([
//                     "inStock",
//                     "in_stock",
//                     "In Stock"
//                   ]) === true || mapField([
//                     "status",
//                     "Status"
//                   ])?.toLowerCase() === "in stock",
//                   features: parseArrayField(mapField(["features", "Features"])),
//                   tags: parseArrayField(mapField(["tags", "Tags"])),
//                   images: additionalImages,
//                   needsImageProcessing: needsImageProcessing,
//                   originalImageURLs: needsImageProcessing ? allImageURLs : undefined,
//                 };

//                 if (!productData.sku) {
//                   productData.sku = generateSKU(productData, index);
//                 }

//                 return productData;
//               }
//             );

//             resolve(products);
//           } catch (error) {
//             reject(
//               new Error(
//                 "Error processing CSV data: " +
//                   (error instanceof Error ? error.message : "Unknown error")
//               )
//             );
//           }
//         },
//         error: (error: any) => {
//           reject(new Error("CSV parsing error: " + error.message));
//         },
//       });
//     });
//   };

//   const handleFileUpload = async (file: File) => {
//     if (!file) return;

//     const isJSON = file.name.endsWith(".json");
//     const isCSV = file.name.endsWith(".csv");

//     if (!isJSON && !isCSV) {
//       alert("Please upload a JSON or CSV file");
//       return;
//     }

//     try {
//       let parsedProducts: Product[] = [];

//       if (isJSON) {
//         const text = await file.text();
//         const json = JSON.parse(text);

//         if (!Array.isArray(json)) {
//           alert("JSON file must contain an array of products");
//           return;
//         }

//         parsedProducts = json.map((product, index) => {
//           const imageURL = product.imageURL || "";
//           const additionalImages = Array.isArray(product.images) ? product.images : [];
//           const allImageURLs = [imageURL, ...additionalImages].filter(Boolean);
          
//           // Check if images need processing (not already on Cloudinary)
//           const needsImageProcessing = imageURL && !imageURL.includes('res.cloudinary.com');
          
//           return {
//             ...product,
//             sku: product.sku || generateSKU(product, index),
//             needsImageProcessing: needsImageProcessing,
//             originalImageURLs: needsImageProcessing ? allImageURLs : undefined,
//           };
//         });
//         setLastFileType("JSON");
//       } else if (isCSV) {
//         parsedProducts = await parseCSVData(file);
//         setLastFileType("CSV");
//       }

//       // Check for duplicate SKUs
//       const skuMap = new Map<string, number>();
//       const duplicateSKUs: string[] = [];

//       parsedProducts.forEach((product, index) => {
//         if (skuMap.has(product.sku)) {
//           duplicateSKUs.push(product.sku);
//         } else {
//           skuMap.set(product.sku, index);
//         }
//       });

//       if (duplicateSKUs.length > 0) {
//         alert(`Warning: Found duplicate SKUs in your file: ${[...new Set(duplicateSKUs)].join(', ')}\n\nEach product should have a unique SKU. Please fix and re-upload.`);
//         return;
//       }

//       // Validate products
//       const validProducts: Product[] = [];
//       const invalidProducts: Array<{ product: any; errors: string[] }> = [];

//       parsedProducts.forEach((product, index) => {
//         const validationErrors = validateProduct(product);
//         if (validationErrors.length === 0) {
//           if (!product.slug) {
//             product.slug = generateSlug(product.itemName);
//           }
//           validProducts.push(product);
//         } else {
//           invalidProducts.push({
//             product: { ...product, index },
//             errors: validationErrors,
//           });
//         }
//       });

//       if (invalidProducts.length > 0) {
//         const proceed = confirm(
//           `Found ${invalidProducts.length} invalid products. Continue with ${validProducts.length} valid products?`
//         );
//         if (!proceed) return;
//       }

//       setProducts(validProducts);
//       setUploadResult(null);
//     } catch (err) {
//       alert(
//         `Invalid ${isJSON ? "JSON" : "CSV"} file. Please check the format and try again.\n\nError: ${err instanceof Error ? err.message : "Unknown error"}`
//       );
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) handleFileUpload(file);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setDragOver(false);
//     const file = e.dataTransfer.files[0];
//     if (file) handleFileUpload(file);
//   };

//   const generateSlug = (text: string) =>
//     text
//       .toLowerCase()
//       .replace(/\s+/g, "-")
//       .replace(/[^\w\-]+/g, "");

//   const uploadToFirestore = async () => {
//   if (products.length === 0) return;

//   setUploading(true);
//   setUploadProgress(0);
//   setCurrentUploadStatus("Starting upload...");

//   const results: UploadResult = {
//     success: 0,
//     failed: 0,
//     errors: [],
//   };

//   const productRef = collection(db, "products");

//   // Count total operations (products + images)
//   let totalOperations = 0;
//   let completedOperations = 0;

//   products.forEach((product) => {
//     totalOperations++; // saving product
//     if (product.needsImageProcessing && product.originalImageURLs) {
//       totalOperations += product.originalImageURLs.length; // each image
//     }
//   });

//   const batchSize = 3;

//   for (let i = 0; i < products.length; i += batchSize) {
//     const batch = products.slice(i, i + batchSize);

//     await Promise.allSettled(
//       batch.map(async (product) => {
//         try {
//           let finalProduct = { ...product };
//           let imageErrors: string[] = [];

//           if (product.needsImageProcessing && product.originalImageURLs) {
//             const cloudinaryURLs: string[] = [];

//             for (let imgIndex = 0; imgIndex < product.originalImageURLs.length; imgIndex++) {
//               const originalURL = product.originalImageURLs[imgIndex];
//               try {
//                 setCurrentUploadStatus(`Processing image ${imgIndex + 1}/${product.originalImageURLs.length} for ${product.itemName}...`);

//                 // Download
//                 const urlParts = originalURL.split("/");
//                 const originalFilename = urlParts[urlParts.length - 1] || `image-${imgIndex + 1}.jpg`;
//                 const filename = `${product.sku}-${imgIndex + 1}-${originalFilename}`;
//                 const imageFile = await downloadImageFromURL(originalURL, filename);

//                 // Compress + upload
//                 const compressedImage = await compressImage(imageFile);
//                 const cloudinaryURL = await retryUpload(compressedImage, 3);

//                 cloudinaryURLs.push(cloudinaryURL);

//               } catch (imageError: any) {
//                 console.error(`Failed to process image for ${product.itemName}`, imageError);
//                 imageErrors.push(originalURL);
//                 // fallback: keep original url
//                 cloudinaryURLs.push(originalURL);
//               } finally {
//                 completedOperations++;
//                 setUploadProgress((completedOperations / totalOperations) * 100);
//               }
//             }

//             // Update product
//             finalProduct.imageURL = cloudinaryURLs[0];
//             finalProduct.images = cloudinaryURLs;

//             // record errors
//             if (imageErrors.length > 0) {
//               results.errors.push({
//                 product,
//                 error: `Some images failed: ${imageErrors.join(", ")}`
//               });
//             }

//             delete finalProduct.needsImageProcessing;
//             delete finalProduct.originalImageURLs;
//           }

//           // Save product
//           const slug = generateSlug(finalProduct.itemName);
//           const productData = {
//             ...finalProduct,
//             slug,
//             sku: finalProduct.sku.toUpperCase(),
//             inStock:
//               finalProduct.inStock !== false &&
//               (finalProduct.stockQuantity === undefined || finalProduct.stockQuantity > 0),
//             stockQuantity: finalProduct.stockQuantity || 0,
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//             features: Array.isArray(finalProduct.features) ? finalProduct.features : [],
//             tags: Array.isArray(finalProduct.tags) ? finalProduct.tags : [],
//             images: Array.isArray(finalProduct.images)
//               ? finalProduct.images
//               : [finalProduct.imageURL].filter(Boolean),
//           };

//           await addDoc(productRef, productData);
//           results.success++;

//         } catch (error: any) {
//           results.failed++;
//           results.errors.push({
//             product,
//             error: error.message || "Unknown error",
//           });
//         } finally {
//           completedOperations++;
//           setUploadProgress((completedOperations / totalOperations) * 100);
//         }
//       })
//     );
//   }

//   setUploading(false);
//   setUploadResult(results);
//   setCurrentUploadStatus("");

//   // ✅ Smarter final message
//   if (results.failed === 0 && results.errors.length === 0) {
//     alert(`✅ All ${results.success} products uploaded. All images processed to Cloudinary!`);
//   } else if (results.failed === 0 && results.errors.length > 0) {
//     alert(`⚠️ ${results.success} products uploaded. Some images could not be uploaded to Cloudinary and are still using original URLs.`);
//   } else {
//     alert(`⚠️ Upload finished. ${results.success} succeeded, ${results.failed} failed. Check errors for details.`);
//   }

//   if (results.success > 0) {
//     try {
//       setCurrentUploadStatus("Clearing cache...");
//       await clearAllProductCaches();
//     } catch (cacheError) {
//       console.warn("Cache clearing failed:", cacheError);
//     }
//   }
// };


//   const resetUpload = () => {
//     setProducts([]);
//     setUploadResult(null);
//     setUploadProgress(0);
//     setLastFileType("");
//   };

//   const navigateBack = () => {
//     if (typeof window !== "undefined" && window.history.length > 1) {
//       window.history.back();
//     } else {
//       window.location.href = "/dashboard";
//     }
//   };

//   return (
//     <div>
//       <Header />
//       <div className="p-6 max-w-4xl mx-auto min-h-[500px]">
//         {/* Back to Dashboard */}
//         <div className="mb-6">
//           <button
//             onClick={navigateBack}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
//           >
//             <Icon
//               icon="lucide:arrow-left"
//               width={20}
//               height={20}
//               className="group-hover:-translate-x-1 transition-transform"
//             />
//             Back to Dashboard
//           </button>
//         </div>

//         <div className="bg-white rounded-lg shadow-lg p-6">
//           <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
//             <Icon icon="lucide:upload" className="text-blue-600" />
//             Bulk Product Upload with Auto Image Processing
//           </h2>

//           {/* Introductory Text */}
//           <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
//             <h3 className="font-semibold text-gray-800 mb-2">
//               Automatic Image Processing
//             </h3>
//             <p className="text-gray-700 mb-2">
//               Upload products with image URLs from any domain. The system will automatically download, 
//               compress, and upload all images to your Cloudinary account for optimal performance.
//             </p>
//             <div className="text-sm text-gray-600">
//               <strong>Auto Processing:</strong> Downloads external images • Compresses to 800px max • 
//               Uploads to Cloudinary • Updates product records with new URLs
//             </div>
//           </div>

//           {/* Upload Area */}
//           <div
//             className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
//               dragOver
//                 ? "border-blue-500 bg-blue-50"
//                 : "border-gray-300 hover:border-gray-400"
//             }`}
//             onDragOver={(e) => {
//               e.preventDefault();
//               setDragOver(true);
//             }}
//             onDragLeave={() => setDragOver(false)}
//             onDrop={handleDrop}
//           >
//             <Icon
//               icon="lucide:upload"
//               className="mx-auto h-12 w-12 text-gray-400 mb-4"
//             />
//             <p className="text-lg mb-2">Drop your JSON or CSV file here or</p>
//             <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer inline-block transition-colors">
//               Choose File
//               <input
//                 type="file"
//                 accept=".json,.csv"
//                 onChange={handleInputChange}
//                 className="hidden"
//               />
//             </label>
//             <p className="text-sm text-gray-500 mt-2">
//               JSON or CSV file with products and image URLs (max 10MB)
//             </p>
//             <details className="mt-2 text-xs text-gray-400">
//               <summary className="cursor-pointer hover:text-gray-600">
//                 Expected CSV columns
//               </summary>
//               <div className="mt-1 pl-4">
//                 <p>
//                   <strong>Required:</strong> itemName, amount, category, subcategory, brand, imageURL, sku
//                 </p>
//                 <p>
//                   <strong>Optional:</strong> slug, status, stockQuantity, inStock, features, tags, images
//                 </p>
//                 <p>
//                   <em>
//                     Images from any domain will be automatically processed and uploaded to Cloudinary
//                   </em>
//                 </p>
//               </div>
//             </details>
//           </div>

//           {/* Products Preview */}
//           {products.length > 0 && !uploadResult && (
//             <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <Icon icon="lucide:check-circle" className="text-green-500" />
//                   <span className="font-semibold">
//                     {products.length} products loaded
//                   </span>
//                   {lastFileType && (
//                     <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
//                       {lastFileType}
//                     </span>
//                   )}
//                   {products.some(p => p.needsImageProcessing) && (
//                     <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
//                       Images Need Processing
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setShowPreview(!showPreview)}
//                     className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
//                   >
//                     <Icon icon="lucide:eye" width={16} height={16} />
//                     {showPreview ? "Hide" : "Preview"}
//                   </button>
//                   <button
//                     onClick={resetUpload}
//                     className="flex items-center gap-1 text-red-600 hover:text-red-700"
//                   >
//                     <Icon icon="lucide:x" width={16} height={16} />
//                     Clear
//                   </button>
//                 </div>
//               </div>

//               {showPreview && (
//                 <div className="max-h-64 overflow-y-auto border rounded p-3 bg-white">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="border-b">
//                         <th className="text-left p-2">Name</th>
//                         <th className="text-left p-2">SKU</th>
//                         <th className="text-left p-2">Category</th>
//                         <th className="text-left p-2">Brand</th>
//                         <th className="text-left p-2">Amount</th>
//                         <th className="text-left p-2">Image Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {products.slice(0, 10).map((product, index) => (
//                         <tr key={index} className="border-b">
//                           <td className="p-2">{product.itemName}</td>
//                           <td className="p-2">
//                             <code className="bg-gray-100 px-2 py-1 rounded text-xs">
//                               {product.sku}
//                             </code>
//                           </td>
//                           <td className="p-2">{product.category}</td>
//                           <td className="p-2">{product.brand}</td>
//                           <td className="p-2">${product.amount}</td>
//                           <td className="p-2">
//                             {product.imageURL?.includes('res.cloudinary.com') ? (
//                               <span className="text-green-600 text-xs">Already on Cloudinary</span>
//                             ) : product.needsImageProcessing ? (
//                               <span className="text-orange-600 text-xs">
//                                 Will process ({product.originalImageURLs?.length || 1} images)
//                               </span>
//                             ) : (
//                               <span className="text-gray-600 text-xs">Ready</span>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {products.length > 10 && (
//                     <p className="text-gray-500 text-center mt-2">
//                       ...and {products.length - 10} more products
//                     </p>
//                   )}
//                 </div>
//               )}

//               <div className="flex gap-3 mt-4">
//                 <button
//                   onClick={uploadToFirestore}
//                   disabled={uploading}
//                   className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
//                 >
//                   {uploading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                       Processing... {Math.round(uploadProgress)}%
//                     </>
//                   ) : (
//                     <>
//                       <Icon icon="lucide:upload" width={16} height={16} />
//                       Process Images & Upload to Firestore
//                     </>
//                   )}
//                 </button>
//               </div>

//               {uploading && (
//                 <div className="mt-4">
//                   <div className="flex justify-between text-sm text-gray-600 mb-2">
//                     <span>{currentUploadStatus}</span>
//                     <span>{Math.round(uploadProgress)}%</span>
//                   </div>
//                   <div className="bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                       style={{ width: `${uploadProgress}%` }}
//                     ></div>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Processing external images and uploading to Cloudinary... This may take a while.
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Upload Results */}
//           {uploadResult && (
//             <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//               <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
//                 {uploadResult.failed === 0 ? (
//                   <Icon icon="lucide:check-circle" className="text-green-500" />
//                 ) : (
//                   <Icon
//                     icon="lucide:alert-circle"
//                     className="text-yellow-500"
//                   />
//                 )}
//                 {uploadResult.failed === 0
//                   ? "Upload Successful!"
//                   : "Upload Complete"}
//               </h3>

//               {uploadResult.failed === 0 && (
//                 <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
//                   <p className="text-green-700 font-medium">
//                     All {uploadResult.success} products have been successfully uploaded with images processed and stored on Cloudinary!
//                   </p>
//                 </div>
//               )}

//               <div className="grid grid-cols-2 gap-4 mb-4">
//                 <div className="bg-green-100 p-3 rounded">
//                   <div className="text-2xl font-bold text-green-700">
//                     {uploadResult.success}
//                   </div>
//                   <div className="text-green-600">Successful uploads</div>
//                 </div>
//                 <div className="bg-red-100 p-3 rounded">
//                   <div className="text-2xl font-bold text-red-700">
//                     {uploadResult.failed}
//                   </div>
//                   <div className="text-red-600">Failed uploads</div>
//                 </div>
//               </div>

//               {uploadResult.errors.length > 0 && (
//                 <div className="bg-red-50 border border-red-200 rounded p-3">
//                   <h4 className="font-semibold text-red-800 mb-2">
//                     Failed Uploads:
//                   </h4>
//                   <div className="max-h-32 overflow-y-auto">
//                     {uploadResult.errors.map((error, index) => (
//                       <div key={index} className="text-sm text-red-700 mb-1">
//                         • {error.product.itemName} (SKU: {error.product.sku}): {error.error}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="flex gap-3 mt-4">
//                 <button
//                   onClick={resetUpload}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//                 >
//                   <Icon icon="lucide:upload" width={16} height={16} />
//                   Upload More Products
//                 </button>
//                 <button
//                   onClick={navigateBack}
//                   className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//                 >
//                   <Icon icon="lucide:arrow-left" width={16} height={16} />
//                   Back to Dashboard
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Enhanced Documentation */}
//           <div className="mt-6 space-y-3">
//             <details className="bg-white border border-gray-200 rounded-lg">
//               <summary className="cursor-pointer p-3 font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
//                 <Icon
//                   icon="lucide:image"
//                   width={16}
//                   height={16}
//                   className="text-purple-500"
//                 />
//                 Automatic Image Processing
//               </summary>
//               <div className="p-3 border-t border-gray-200 bg-gray-50">
//                 <h4 className="font-medium text-gray-800 mb-2">How It Works:</h4>
//                 <div className="text-sm text-gray-600 space-y-2">
//                   <div className="flex items-start gap-2">
//                     <Icon icon="lucide:download" width={16} height={16} className="text-blue-500 mt-0.5" />
//                     <div>
//                       <p><strong>Download:</strong> System automatically downloads images from any URLs in your data</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <Icon icon="lucide:compress" width={16} height={16} className="text-green-500 mt-0.5" />
//                     <div>
//                       <p><strong>Compress:</strong> Images are resized to 800px maximum and converted to JPEG</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <Icon icon="lucide:cloud-upload" width={16} height={16} className="text-orange-500 mt-0.5" />
//                     <div>
//                       <p><strong>Upload:</strong> Processed images are uploaded to your Cloudinary account</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <Icon icon="lucide:refresh-cw" width={16} height={16} className="text-purple-500 mt-0.5" />
//                     <div>
//                       <p><strong>Update:</strong> Product records are updated with new Cloudinary URLs</p>
//                     </div>
//                   </div>
                  
//                   <div className="mt-3 p-2 bg-yellow-100 rounded">
//                     <p className="text-xs text-yellow-700">
//                       <strong>Note:</strong> Images already hosted on res.cloudinary.com will be skipped to avoid duplicates.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </details>

//             <details className="bg-white border border-gray-200 rounded-lg">
//               <summary className="cursor-pointer p-3 font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
//                 <Icon
//                   icon="lucide:code"
//                   width={16}
//                   height={16}
//                   className="text-blue-500"
//                 />
//                 JSON Structure Example
//               </summary>
//               <div className="p-3 border-t border-gray-200 bg-gray-50">
//                 <p className="text-xs text-gray-600 mb-2">
//                   Your JSON file should contain products with image URLs from any domain:
//                 </p>
//                 <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
//                   {`[
//   {
//     "itemName": "iPhone 15 Pro",
//     "amount": 999,
//     "category": "Electronics",
//     "subcategory": "Smartphones",
//     "brand": "Apple",
//     "imageURL": "https://example.com/iphone15.jpg",
//     "sku": "APL-IPH-15-PRO-128",
//     "stockQuantity": 50,
//     "images": [
//       "https://example.com/iphone15-2.jpg",
//       "https://example.com/iphone15-3.jpg"
//     ],
//     "features": ["128GB", "Pro Camera", "Titanium"],
//     "tags": ["premium", "mobile", "5G"]
//   },
//   {
//     "itemName": "Samsung Galaxy S24",
//     "amount": 799,
//     "category": "Electronics",
//     "subcategory": "Smartphones",
//     "brand": "Samsung",
//     "imageURL": "https://anothersite.com/galaxy-s24.png",
//     "sku": "SAM-GAL-S24-256",
//     "stockQuantity": 75
//   }
// ]`}
//                 </pre>
//                 <div className="mt-2 text-xs">
//                   <span className="text-green-600 font-medium">
//                     Automatic Processing:
//                   </span>{" "}
//                   All external image URLs will be downloaded, compressed, and uploaded to your Cloudinary account
//                 </div>
//               </div>
//             </details>

//             <details className="bg-white border border-gray-200 rounded-lg">
//               <summary className="cursor-pointer p-3 font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
//                 <Icon
//                   icon="lucide:download"
//                   width={16}
//                   height={16}
//                   className="text-purple-500"
//                 />
//                 Download Sample Files
//               </summary>
//               <div className="p-3 border-t border-gray-200 bg-gray-50">
//                 <p className="text-xs text-gray-600 mb-3">
//                   Download sample files with external image URLs for testing:
//                 </p>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => {
//                       const sampleData = [
//                         {
//                           itemName: "iPhone 15 Pro",
//                           amount: 999,
//                           category: "Electronics",
//                           subcategory: "Smartphones",
//                           brand: "Apple",
//                           imageURL: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
//                           sku: "APL-IPH-15-PRO-128",
//                           stockQuantity: 50,
//                           inStock: true,
//                           status: "in stock",
//                           features: ["128GB", "Pro Camera", "Titanium"],
//                           tags: ["premium", "mobile", "5G"],
//                           images: [
//                             "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600",
//                             "https://images.unsplash.com/photo-1695048066315-a0ea4c8e1a91?w=600"
//                           ]
//                         },
//                         {
//                           itemName: "Samsung Galaxy S24",
//                           amount: 799,
//                           category: "Electronics",
//                           subcategory: "Smartphones",
//                           brand: "Samsung",
//                           imageURL: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
//                           sku: "SAM-GAL-S24-256",
//                           stockQuantity: 75,
//                           inStock: true,
//                           status: "in stock",
//                           features: ["256GB", "AI Camera"],
//                           tags: ["android", "mobile"],
//                         },
//                       ];
//                       const blob = new Blob(
//                         [JSON.stringify(sampleData, null, 2)],
//                         { type: "application/json" }
//                       );
//                       const url = URL.createObjectURL(blob);
//                       const a = document.createElement("a");
//                       a.href = url;
//                       a.download = "sample-products-auto-cloudinary.json";
//                       a.click();
//                       URL.revokeObjectURL(url);
//                     }}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
//                   >
//                     <Icon icon="lucide:file-json" width={12} height={12} />
//                     Sample JSON
//                   </button>
//                   <button
//                     onClick={() => {
//                       const csvContent = `itemName,amount,category,subcategory,brand,imageURL,sku,stockQuantity,status,features,tags
// iPhone 15 Pro,999,Electronics,Smartphones,Apple,https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800,APL-IPH-15-PRO-128,50,in stock,"128GB,Pro Camera,Titanium","premium,mobile,5G"
// Samsung Galaxy S24,799,Electronics,Smartphones,Samsung,https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800,SAM-GAL-S24-256,75,in stock,"256GB,AI Camera","android,mobile"
// MacBook Pro M3,1999,Electronics,Laptops,Apple,https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800,APL-MBP-M3-16GB,25,in stock,"M3 Chip,16GB RAM","laptop,professional"`;
//                       const blob = new Blob([csvContent], { type: "text/csv" });
//                       const url = URL.createObjectURL(blob);
//                       const a = document.createElement("a");
//                       a.href = url;
//                       a.download = "sample-products-auto-cloudinary.csv";
//                       a.click();
//                       URL.revokeObjectURL(url);
//                     }}
//                     className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
//                   >
//                     <Icon
//                       icon="lucide:file-spreadsheet"
//                       width={12}
//                       height={12}
//                     />
//                     Sample CSV
//                   </button>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-2">
//                   These samples use Unsplash images that will be automatically processed to Cloudinary
//                 </p>
//               </div>
//             </details>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// }






"use client";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Papa, { ParseResult } from "papaparse";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { clearAllProductCaches } from "@/lib/cacheUtils";

interface Product {
  itemName: string;
  amount: number;
  category: string;
  subcategory: string;
  brand: string;
  imageURL: string;
  slug: string;
  sku: string; // ✅ ADDED: SKU field as required
  // Optional properties that may exist in uploaded JSON
  status?: string;
  inStock?: boolean;
  stockQuantity?: number; // ✅ ADDED: Stock quantity for inventory
  features?: string[];
  tags?: string[];
  images?: string[];
}

interface UploadResult {
  success: number;
  failed: number;
  errors: Array<{ product: Product; error: string }>;
}

export default function UploadBulkProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastFileType, setLastFileType] = useState<string>("");

  const validateProduct = (product: any): string[] => {
    const errors: string[] = [];
    const requiredFields = [
      "itemName",
      "amount",
      "category",
      "subcategory",
      "brand",
      "imageURL",
      "sku", // ✅ ADDED: SKU as required field
    ];

    requiredFields.forEach((field) => {
      const value = product[field];
      if (
        !value ||
        value === "" ||
        (typeof value === "string" && value.trim() === "")
      ) {
        errors.push(`Missing ${field}`);
      }
    });

    if (
      typeof product.amount !== "number" ||
      product.amount < 0 ||
      isNaN(product.amount)
    ) {
      errors.push("Amount must be a positive number");
    }

    if (product.imageURL && !isValidURL(product.imageURL.toString().trim())) {
      errors.push("Invalid image URL");
    }

    // ✅ ADDED: SKU validation
    if (product.sku && typeof product.sku === "string") {
      const sku = product.sku.trim();
      if (sku.length < 3) {
        errors.push("SKU must be at least 3 characters long");
      }
      if (!/^[A-Za-z0-9\-_]+$/.test(sku)) {
        errors.push("SKU can only contain letters, numbers, hyphens, and underscores");
      }
    }

    // ✅ ADDED: Stock quantity validation
    if (product.stockQuantity !== undefined) {
      if (typeof product.stockQuantity !== "number" || product.stockQuantity < 0) {
        errors.push("Stock quantity must be a non-negative number");
      }
    }

    return errors;
  };

  const isValidURL = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // ✅ ADDED: Generate SKU if missing
  const generateSKU = (product: any, index: number): string => {
    if (product.sku && typeof product.sku === "string" && product.sku.trim()) {
      return product.sku.trim().toUpperCase();
    }
    
    // Auto-generate SKU from brand, category, and index
    const brand = (product.brand || "GEN").substring(0, 3).toUpperCase();
    const category = (product.category || "CAT").substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    const indexStr = String(index + 1).padStart(3, '0');
    
    return `${brand}-${category}-${timestamp}${indexStr}`;
  };

  const parseCSVData = async (file: File): Promise<Product[]> => {
    const text = await file.text();

    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimitersToGuess: [",", "\t", "|", ";"],
        complete: (results: ParseResult<any>) => {
          try {
            const products: Product[] = results.data.map(
              (row: any, index: number) => {
                // Clean headers by removing whitespace
                const cleanRow: any = {};
                Object.keys(row).forEach((key) => {
                  const cleanKey = key.trim();
                  cleanRow[cleanKey] = row[key];
                });

                // Map CSV columns to Product interface
                // Handle common CSV header variations
                const mapField = (possibleNames: string[]) => {
                  for (const name of possibleNames) {
                    if (
                      cleanRow[name] !== undefined &&
                      cleanRow[name] !== null &&
                      cleanRow[name] !== ""
                    ) {
                      return cleanRow[name];
                    }
                  }
                  return "";
                };

                // Parse features and tags if they're comma-separated strings
                const parseArrayField = (field: any): string[] => {
                  if (Array.isArray(field)) return field;
                  if (typeof field === "string" && field.trim()) {
                    return field
                      .split(",")
                      .map((item) => item.trim())
                      .filter((item) => item);
                  }
                  return [];
                };

                const productData = {
                  itemName: mapField([
                    "itemName",
                    "name",
                    "product_name",
                    "title",
                    "Item Name",
                    "Product Name",
                  ]),
                  amount: parseFloat(
                    mapField([
                      "amount",
                      "price",
                      "cost",
                      "Amount",
                      "Price",
                      "Cost",
                    ]) || "0"
                  ),
                  category: mapField(["category", "Category"]),
                  subcategory: mapField([
                    "subcategory",
                    "sub_category",
                    "Subcategory",
                    "Sub Category",
                  ]),
                  brand: mapField([
                    "brand",
                    "Brand",
                    "manufacturer",
                    "Manufacturer",
                  ]),
                  imageURL: mapField([
                    "imageURL",
                    "image_url",
                    "image",
                    "Image URL",
                    "Image",
                    "photo",
                  ]),
                  slug: mapField(["slug", "Slug"]) || "",
                  // ✅ ADDED: SKU mapping with flexible column names
                  sku: mapField([
                    "sku",
                    "SKU",
                    "productCode",
                    "product_code",
                    "itemCode",
                    "item_code",
                    "Product Code",
                    "Item Code"
                  ]) || "",
                  status: mapField([
                    "status",
                    "Status",
                    "availability",
                    "Availability",
                  ]),
                  // ✅ ADDED: Stock quantity mapping
                  stockQuantity: parseInt(
                    mapField([
                      "stockQuantity",
                      "stock_quantity",
                      "stock",
                      "quantity",
                      "qty",
                      "Stock Quantity",
                      "Stock",
                      "Quantity"
                    ]) || "0"
                  ),
                  inStock: mapField([
                    "inStock",
                    "in_stock",
                    "In Stock"
                  ]) === true || mapField([
                    "status",
                    "Status"
                  ])?.toLowerCase() === "in stock",
                  features: parseArrayField(mapField(["features", "Features"])),
                  tags: parseArrayField(mapField(["tags", "Tags"])),
                  images: parseArrayField(
                    mapField(["images", "Images", "image_urls", "Image URLs"])
                  ),
                };

                // Generate SKU if missing
                if (!productData.sku) {
                  productData.sku = generateSKU(productData, index);
                }

                return productData;
              }
            );

            resolve(products);
          } catch (error) {
            reject(
              new Error(
                "Error processing CSV data: " +
                  (error instanceof Error ? error.message : "Unknown error")
              )
            );
          }
        },
        error: (error: any) => {
          reject(new Error("CSV parsing error: " + error.message));
        },
      });
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const isJSON = file.name.endsWith(".json");
    const isCSV = file.name.endsWith(".csv");

    if (!isJSON && !isCSV) {
      alert("Please upload a JSON or CSV file");
      return;
    }

    try {
      let parsedProducts: Product[] = [];

      if (isJSON) {
        // Handle JSON files
        const text = await file.text();
        const json = JSON.parse(text);

        if (!Array.isArray(json)) {
          alert("JSON file must contain an array of products");
          return;
        }

        parsedProducts = json.map((product, index) => ({
          ...product,
          sku: product.sku || generateSKU(product, index)
        }));
        setLastFileType("JSON");
      } else if (isCSV) {
        // Handle CSV files
        parsedProducts = await parseCSVData(file);
        setLastFileType("CSV");
      }

      // ✅ ADDED: Check for duplicate SKUs
      const skuMap = new Map<string, number>();
      const duplicateSKUs: string[] = [];

      parsedProducts.forEach((product, index) => {
        if (skuMap.has(product.sku)) {
          duplicateSKUs.push(product.sku);
        } else {
          skuMap.set(product.sku, index);
        }
      });

      if (duplicateSKUs.length > 0) {
        alert(`Warning: Found duplicate SKUs in your file: ${[...new Set(duplicateSKUs)].join(', ')}\n\nEach product should have a unique SKU. Please fix and re-upload.`);
        return;
      }

      // Validate products
      const validProducts: Product[] = [];
      const invalidProducts: Array<{ product: any; errors: string[] }> = [];

      parsedProducts.forEach((product, index) => {
        const validationErrors = validateProduct(product);
        if (validationErrors.length === 0) {
          // Generate slug if missing
          if (!product.slug) {
            product.slug = generateSlug(product.itemName);
          }
          validProducts.push(product);
        } else {
          invalidProducts.push({
            product: { ...product, index },
            errors: validationErrors,
          });
        }
      });

      if (invalidProducts.length > 0) {
        const proceed = confirm(
          `Found ${invalidProducts.length} invalid products. Continue with ${validProducts.length} valid products?`
        );
        if (!proceed) return;
      }

      setProducts(validProducts);
      setUploadResult(null);
    } catch (err) {
      alert(
        `Invalid ${isJSON ? "JSON" : "CSV"} file. Please check the format and try again.\n\nError: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");

  const uploadToFirestore = async () => {
    if (products.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const results: UploadResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    const productRef = collection(db, "products");

    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (product) => {
          try {
            // Generate slug and ID for each product
            const slug = generateSlug(product.itemName);
            const itemId = `${slug}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            // ✅ UPDATED: Prepare product data with SKU and stock fields
            const productData = {
              ...product,
              slug,
              sku: product.sku.toUpperCase(), // Ensure SKU is uppercase
              inStock: product.inStock !== false && (product.stockQuantity === undefined || product.stockQuantity > 0),
              stockQuantity: product.stockQuantity || 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              // Ensure arrays are properly formatted
              features: Array.isArray(product.features) ? product.features : [],
              tags: Array.isArray(product.tags) ? product.tags : [],
              images: Array.isArray(product.images)
                ? product.images
                : [product.imageURL].filter(Boolean),
            };

            await addDoc(productRef, productData);
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push({
              product,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        })
      );

      setUploadProgress(
        Math.min(100, ((i + batchSize) / products.length) * 100)
      );
    }

    if (results.success > 0) {
      try {
        await clearAllProductCaches();
        console.log("Cache cleared successfully!");
      } catch (cacheError) {
        console.warn("Cache clearing failed:", cacheError);
      }
    }

    setUploading(false);
    setUploadResult(results);

    if (results.failed === 0) {
      setProducts([]);
    }
    
    alert("✅ Product upload completed and cache cleared!");
  };

  const resetUpload = () => {
    setProducts([]);
    setUploadResult(null);
    setUploadProgress(0);
    setLastFileType("");
  };

  const navigateBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div>
      <Header />
      <div className="p-6 max-w-4xl mx-auto min-h-[500px]">
        {/* Back to Dashboard */}
        <div className="mb-6">
          <button
            onClick={navigateBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <Icon
              icon="lucide:arrow-left"
              width={20}
              height={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Icon icon="lucide:upload" className="text-blue-600" />
            Bulk Product Upload
          </h2>

          {/* Introductory Text */}
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              📁 Quick Start Guide
            </h3>
            <p className="text-gray-700 mb-2">
              Upload hundreds of products at once using JSON or CSV files.
              Perfect for importing data from scrapers, spreadsheets, or other
              systems.
            </p>
            <div className="text-sm text-gray-600">
              <strong>Supported formats:</strong> JSON arrays, CSV files |
              <strong> Max file size:</strong> 10MB |
              <strong> Processing:</strong> Up to 1000 products per batch
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Icon
              icon="lucide:upload"
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
            />
            <p className="text-lg mb-2">Drop your JSON or CSV file here or</p>
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer inline-block transition-colors">
              Choose File
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              JSON or CSV file with products data (max 10MB)
            </p>
            <details className="mt-2 text-xs text-gray-400">
              <summary className="cursor-pointer hover:text-gray-600">
                Expected CSV columns
              </summary>
              <div className="mt-1 pl-4">
                <p>
                  <strong>Required:</strong> itemName, amount, category,
                  subcategory, brand, imageURL, <span className="text-red-600 font-semibold">sku</span>
                </p>
                <p>
                  <strong>Optional:</strong> slug, status, stockQuantity, inStock, features, tags, images
                </p>
                <p>
                  <em>
                    Note: Column names are flexible (e.g., "sku", "SKU", "productCode", "item_code" all work for sku)
                  </em>
                </p>
              </div>
            </details>
          </div>

          {/* Help Section */}
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon
                icon="lucide:info"
                width={16}
                height={16}
                className="mt-0.5 text-blue-500"
              />
              <div>
                <p className="font-medium mb-1">💡 Pro Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • <strong className="text-red-600">SKUs must be unique</strong> - each product needs a distinct SKU for inventory tracking
                  </li>
                  <li>
                    • Missing SKUs will be auto-generated using brand + category + timestamp
                  </li>
                  <li>
                    • CSV files from scraping tools work best with auto-detection
                  </li>
                  <li>
                    • Features and tags can be comma-separated in CSV (e.g., "feature1,feature2,feature3")
                  </li>
                  <li>
                    • Stock quantities help with inventory management and availability
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Structure Examples */}
          <div className="mt-4 space-y-3">
            <details className="bg-white border border-gray-200 rounded-lg">
              <summary className="cursor-pointer p-3 font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Icon
                  icon="lucide:code"
                  width={16}
                  height={16}
                  className="text-blue-500"
                />
                JSON Structure Example
              </summary>
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">
                  Your JSON file should contain an array of product objects:
                </p>
                <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                  {`[
  {
    "itemName": "iPhone 15 Pro",
    "amount": 999,
    "category": "Electronics",
    "subcategory": "Smartphones", 
    "brand": "Apple",
    "imageURL": "https://example.com/iphone15.jpg",
    "sku": "APL-IPH-15-PRO-128",
    "stockQuantity": 50,
    "inStock": true,
    "slug": "iphone-15-pro",
    "status": "in stock",
    "features": ["128GB", "Pro Camera", "Titanium"],
    "tags": ["premium", "mobile", "5G"],
    "images": [
      "https://example.com/iphone15-1.jpg", 
      "https://example.com/iphone15-2.jpg"
    ]
  },
  {
    "itemName": "MacBook Pro M3",
    "amount": 1999,
    "category": "Electronics",
    "subcategory": "Laptops",
    "brand": "Apple", 
    "imageURL": "https://example.com/macbook.jpg",
    "sku": "APL-MBP-M3-16GB",
    "stockQuantity": 25,
    "inStock": true
  }
]`}
                </pre>
                <div className="mt-2 text-xs">
                  <span className="text-red-600 font-medium">
                    Required fields:
                  </span>{" "}
                  itemName, amount, category, subcategory, brand, imageURL, <strong className="text-red-600">sku</strong>
                  <br />
                  <span className="text-blue-600 font-medium">
                    Optional fields:
                  </span>{" "}
                  slug, status, stockQuantity, inStock, features, tags, images
                </div>
              </div>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg">
              <summary className="cursor-pointer p-3 font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Icon
                  icon="lucide:table"
                  width={16}
                  height={16}
                  className="text-green-500"
                />
                CSV Structure Example
              </summary>
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">
                  Your CSV file should have these columns (flexible naming):
                </p>
                <div className="overflow-x-auto">
                  <table className="text-xs border border-gray-300 bg-white rounded">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-1">itemName</th>
                        <th className="border border-gray-300 px-2 py-1">amount</th>
                        <th className="border border-gray-300 px-2 py-1">category</th>
                        <th className="border border-gray-300 px-2 py-1">subcategory</th>
                        <th className="border border-gray-300 px-2 py-1">brand</th>
                        <th className="border border-gray-300 px-2 py-1">imageURL</th>
                        <th className="border border-gray-300 px-2 py-1 bg-red-50 font-bold">sku</th>
                        <th className="border border-gray-300 px-2 py-1">stockQuantity</th>
                        <th className="border border-gray-300 px-2 py-1">features</th>
                        <th className="border border-gray-300 px-2 py-1">tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1">iPhone 15 Pro</td>
                        <td className="border border-gray-300 px-2 py-1">999</td>
                        <td className="border border-gray-300 px-2 py-1">Electronics</td>
                        <td className="border border-gray-300 px-2 py-1">Smartphones</td>
                        <td className="border border-gray-300 px-2 py-1">Apple</td>
                        <td className="border border-gray-300 px-2 py-1">https://example.com/iphone.jpg</td>
                        <td className="border border-gray-300 px-2 py-1 bg-red-50 font-mono">APL-IPH-15-PRO</td>
                        <td className="border border-gray-300 px-2 py-1">50</td>
                        <td className="border border-gray-300 px-2 py-1">128GB,Pro Camera,Titanium</td>
                        <td className="border border-gray-300 px-2 py-1">premium,mobile,5G</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1">MacBook Pro M3</td>
                        <td className="border border-gray-300 px-2 py-1">1999</td>
                        <td className="border border-gray-300 px-2 py-1">Electronics</td>
                        <td className="border border-gray-300 px-2 py-1">Laptops</td>
                        <td className="border border-gray-300 px-2 py-1">Apple</td>
                        <td className="border border-gray-300 px-2 py-1">https://example.com/macbook.jpg</td>
                        <td className="border border-gray-300 px-2 py-1 bg-red-50 font-mono">APL-MBP-M3-16GB</td>
                        <td className="border border-gray-300 px-2 py-1">25</td>
                        <td className="border border-gray-300 px-2 py-1">M3 Chip,16GB RAM</td>
                        <td className="border border-gray-300 px-2 py-1">laptop,professional</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-xs">
                  <p><span className="text-blue-600 font-medium">Flexible column names:</span></p>
                  <p>• <strong>sku:</strong> sku, SKU, productCode, product_code, itemCode, item_code</p>
                  <p>• <strong>stockQuantity:</strong> stockQuantity, stock_quantity, stock, quantity, qty</p>
                  <p>• <strong>itemName:</strong> name, product_name, title, Item Name, Product Name</p>
                  <p>• <strong>amount:</strong> price, cost, Amount, Price, Cost</p>
                  <p>• <strong>Arrays:</strong> Use comma-separated values for features and tags</p>
                </div>
              </div>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg">
              <summary className="cursor-pointer p-3 font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Icon
                  icon="lucide:download"
                  width={16}
                  height={16}
                  className="text-purple-500"
                />
                Download Sample Files
              </summary>
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600 mb-3">
                  Download sample files to get started quickly:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const sampleData = [
                        {
                          itemName: "iPhone 15 Pro",
                          amount: 999,
                          category: "Electronics",
                          subcategory: "Smartphones",
                          brand: "Apple",
                          imageURL: "https://example.com/iphone15.jpg",
                          sku: "APL-IPH-15-PRO-128",
                          stockQuantity: 50,
                          inStock: true,
                          slug: "iphone-15-pro",
                          status: "in stock",
                          features: ["128GB", "Pro Camera", "Titanium"],
                          tags: ["premium", "mobile", "5G"],
                          images: ["https://example.com/iphone15-1.jpg"],
                        },
                        {
                          itemName: "MacBook Pro M3",
                          amount: 1999,
                          category: "Electronics",
                          subcategory: "Laptops",
                          brand: "Apple",
                          imageURL: "https://example.com/macbook.jpg",
                          sku: "APL-MBP-M3-16GB",
                          stockQuantity: 25,
                          inStock: true,
                          slug: "macbook-pro-m3",
                          status: "in stock",
                          features: ["M3 Chip", "16GB RAM"],
                          tags: ["laptop", "professional"],
                        },
                      ];
                      const blob = new Blob(
                        [JSON.stringify(sampleData, null, 2)],
                        { type: "application/json" }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "sample-products.json";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                  >
                    <Icon icon="lucide:file-json" width={12} height={12} />
                    Sample JSON
                  </button>
                  <button
                    onClick={() => {
                      const csvContent = `itemName,amount,category,subcategory,brand,imageURL,sku,stockQuantity,status,features,tags
iPhone 15 Pro,999,Electronics,Smartphones,Apple,https://example.com/iphone15.jpg,APL-IPH-15-PRO-128,50,in stock,"128GB,Pro Camera,Titanium","premium,mobile,5G"
MacBook Pro M3,1999,Electronics,Laptops,Apple,https://example.com/macbook.jpg,APL-MBP-M3-16GB,25,in stock,"M3 Chip,16GB RAM","laptop,professional"
Samsung Galaxy S24,799,Electronics,Smartphones,Samsung,https://example.com/galaxy.jpg,SAM-GAL-S24-256,75,in stock,"256GB,AI Camera","android,mobile"`;
                      const blob = new Blob([csvContent], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "sample-products.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                  >
                    <Icon
                      icon="lucide:file-spreadsheet"
                      width={12}
                      height={12}
                    />
                    Sample CSV
                  </button>
                </div>
              </div>
            </details>
          </div>

          {/* Products Preview */}
          {products.length > 0 && !uploadResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:check-circle" className="text-green-500" />
                  <span className="font-semibold">
                    {products.length} products loaded
                  </span>
                  {lastFileType && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {lastFileType}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Icon icon="lucide:eye" width={16} height={16} />
                    {showPreview ? "Hide" : "Preview"}
                  </button>
                  <button
                    onClick={resetUpload}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Icon icon="lucide:x" width={16} height={16} />
                    Clear
                  </button>
                </div>
              </div>

              {showPreview && (
                <div className="max-h-64 overflow-y-auto border rounded p-3 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">SKU</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-left p-2">Brand</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 10).map((product, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{product.itemName}</td>
                          <td className="p-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {product.sku}
                            </code>
                          </td>
                          <td className="p-2">{product.category}</td>
                          <td className="p-2">{product.brand}</td>
                          <td className="p-2">${product.amount}</td>
                          <td className="p-2">
                            {product.stockQuantity !== undefined ? (
                              <span className={product.stockQuantity > 0 ? "text-green-600" : "text-red-600"}>
                                {product.stockQuantity}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {products.length > 10 && (
                    <p className="text-gray-500 text-center mt-2">
                      ...and {products.length - 10} more products
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={uploadToFirestore}
                  disabled={uploading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Uploading... {Math.round(uploadProgress)}%
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:upload" width={16} height={16} />
                      Upload to Firestore
                    </>
                  )}
                </button>
              </div>

              {uploading && (
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                {uploadResult.failed === 0 ? (
                  <Icon icon="lucide:check-circle" className="text-green-500" />
                ) : (
                  <Icon
                    icon="lucide:alert-circle"
                    className="text-yellow-500"
                  />
                )}
                {uploadResult.failed === 0
                  ? "🎉 Upload Successful!"
                  : "Upload Complete"}
              </h3>

              {uploadResult.failed === 0 && (
                <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                  <p className="text-green-700 font-medium">
                    Great job! All {uploadResult.success} products have been
                    successfully uploaded to your store with unique SKUs for inventory tracking.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded">
                  <div className="text-2xl font-bold text-green-700">
                    {uploadResult.success}
                  </div>
                  <div className="text-green-600">Successful uploads</div>
                </div>
                <div className="bg-red-100 p-3 rounded">
                  <div className="text-2xl font-bold text-red-700">
                    {uploadResult.failed}
                  </div>
                  <div className="text-red-600">Failed uploads</div>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Failed Uploads:
                  </h4>
                  <div className="max-h-32 overflow-y-auto">
                    {uploadResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        • {error.product.itemName} (SKU: {error.product.sku}): {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={resetUpload}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Icon icon="lucide:upload" width={16} height={16} />
                  Upload More Products
                </button>
                <button
                  onClick={navigateBack}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Icon icon="lucide:arrow-left" width={16} height={16} />
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}