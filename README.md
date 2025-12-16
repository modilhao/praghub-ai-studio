# Praghub 🛡️

**Praghub** is a modern marketplace connecting customers with reliable pest control companies. The platform simplifies the process of finding, comparing, and contacting verified service providers for residential, commercial, and industrial needs.

## 🚀 Features

### For Customers
- **Smart Search**: Find companies by city/neighborhood and specific pest types (termites, ants, rats, etc.).
- **Verified Listings**: Access profiles of companies with verified badges and "Premium" status.
- **Detailed Profiles**: View ratings, reviews, areas served, and service specialties.
- **Direct Contact**: One-click connection to companies via WhatsApp.
- **Advanced Filters**: Filter by rating, Premium status, and service type (Residential, Commercial, Condo, Industrial).

### For Service Providers (Partners)
- **Partner Registration**: Streamlined 2-step registration process for new companies.
- **Lead Generation**: Receive direct leads via WhatsApp without intermediaries.
- **Visibility**: Options for "Premium" highlighting to increase profile visibility.
- **Dashboard**: (Coming Soon) Dedicated area for managing profile and insights.

## 🛠️ Tech Stack

This project is built with a modern React stack for performance and developer experience:

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Google Material Symbols](https://fonts.google.com/icons)

## 📦 Project Structure

```
src/
├── components/      # Reusable UI components (Header, Footer, Shared)
├── pages/           # Application routes and page views
│   ├── Home.tsx            # Landing page with search and listings
│   ├── Register.tsx        # Partner registration flow
│   ├── CompanyProfile.tsx  # Detailed public company view
│   ├── Login.tsx           # Authentication page
│   └── ...                 # Other utility pages (Admin, Dashboard, Legal)
├── types.ts         # TypeScript definitions for domain entities (Company, etc.)
└── App.tsx          # Main application component and routing setup
```

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd praghub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173` (or the port shown in your terminal).

## 📝 Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Locally preview the production build.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
*Praghub - Connecting you to a pest-free environment.*
