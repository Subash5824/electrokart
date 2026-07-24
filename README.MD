# 🛒 ELECTROKART - B2B Wholesale Credit Card Processing Platform

## 📋 Project Overview

ElectroKart is a comprehensive **B2B Wholesale Credit Card Processing Platform** built with the MERN stack. It enables businesses to purchase mobile accessories in bulk (100-5000 pieces) using a virtual credit card system with real-time transaction tracking, banker approvals, automated billing, and interest calculations.

## 🚀 Features

### Customer Features

- 🔐 **Secure Authentication** - JWT-based login/registration with GST validation
- 🛍️ **Product Catalog** - 8+ mobile accessories with bulk pricing
- 📦 **Wholesale Quantity** - Min 100, Max 5000 pieces, step 10
- 💳 **Credit Card Checkout** - Razorpay integration for secure payments
- 📊 **Customer Dashboard** - Real-time credit card balance tracking
- 💰 **Bill Payments** - Pay full or minimum amount
- 📄 **PDF Statements** - Download monthly statements
- 📱 **Mobile Responsive** - Works on all devices

### Banker Features

- 👨‍💼 **Banker Portal** - Separate login for banking personnel
- 📈 **Dashboard** - Overview with statistics
- ✅ **Transaction Approval** - Approve/decline customer purchases
- 🔒 **Card Management** - Block/unblock customer cards
- 👥 **Customer Management** - View all registered businesses

### Credit Card System

- 💰 **Credit Limit** - ₹1,00,000 per customer
- 📊 **Real-time Balance** - Automatic updates on transactions
- 📈 **Interest Calculation** - 3% monthly on unpaid balance
- 💵 **Minimum Payment** - 5% or ₹500 (whichever higher)
- 📅 **Automated Billing** - Monthly bills with due dates
- 📝 **Transaction History** - Complete purchase and payment records

## 💻 Tech Stack

| Layer              | Technology                                 |
| ------------------ | ------------------------------------------ |
| **Frontend**       | React.js, React Router, Axios, CSS3, jsPDF |
| **Backend**        | Node.js, Express.js, MongoDB, Mongoose     |
| **Authentication** | JWT, Bcryptjs                              |
| **Payment**        | Razorpay                                   |
| **Scheduler**      | Node-cron                                  |

## 🎨 Color Scheme

| Usage           | Hex Code  |
| --------------- | --------- |
| Background      | `#0B0F1A` |
| Primary Button  | `#00A8FF` |
| Price Highlight | `#FFD400` |
| Success         | `#00FF9C` |
| Error           | `#FF4C4C` |

## 🏗️ Architecture
