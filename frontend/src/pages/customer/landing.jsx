import React from 'react';
import CusLayout from '@/components/layout/CusLayout';
import HeroSection from '@/components/customer/HeroSection';
import TopServices from '@/components/customer/TopServices';
import TeamSection from '@/components/customer/TeamSection';
import TestimonialsSection from '@/components/customer/TestimonialsSection';

export default function LandingPage() {

    return (
        <CusLayout activePath="/customer/landing">
            {/* ---------------- SECTION 1: HERO BANNER ---------------- */}
            <HeroSection />

            {/* ---------------- SECTION 2: DỊCH VỤ HÀNG ĐẦU ---------------- */}
            <TopServices />

            {/* ---------------- SECTION 3: ĐỘI NGŨ NHÂN VIÊN ---------------- */}
            <TeamSection />

            {/* ---------------- SECTION 4: NHẬN XÉT TỪ KHÁCH HÀNG ---------------- */}
            <TestimonialsSection />
        </CusLayout>
    );
}