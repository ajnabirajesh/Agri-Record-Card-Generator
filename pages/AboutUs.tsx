import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-semibold mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-6">About Us</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p>
            Welcome to <strong>Agri Record Management System</strong>, an initiative by Ajnabi Creation. We are dedicated to empowering farmers and agricultural workers through digital solutions.
          </p>
          <p>
            Our mission is to simplify the process of generating professional Farmer ID cards (Agri Records) with integrated QR codes and land details. We believe in the vision of Digital India and strive to bring technology to the grassroots level.
          </p>
          <p>
            Founded by Raj Kumar Urf Rajesh Yadav in Supaul, Bihar, Ajnabi Creation has been at the forefront of creating accessible and user-friendly tools for the agricultural community.
          </p>
          <p>
            With our platform, generating a secure and standardized Farmer ID card is just a few clicks away. We ensure data privacy and provide a seamless experience for our users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
