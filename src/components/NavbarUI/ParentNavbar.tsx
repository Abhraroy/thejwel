"use client";
import { useStore } from "@/zustandStore/zustandStore";
import Navbar from "./Navbar";
import OtpInput from "../AuthUI/OtpInput";
import PhoneNumberInput from "../AuthUI/PhoneNumberInput";
import Cart from "../CartUI/Cart";
export default function ParentNavbar() {
    const { setIsCartOpen, MobnoInputState, OtpInputState, isCartOpen, cartCount } = useStore();
    const handleOpenCart = () => {
        setIsCartOpen(true);
    };
    const handleCloseCart = () => {
        setIsCartOpen(false);
    };
    return (
        <div>
            <Navbar cartCount={cartCount} onCartClick={handleOpenCart} />
            {MobnoInputState && !OtpInputState && <PhoneNumberInput />}
            {OtpInputState && !MobnoInputState && <OtpInput />}
            {isCartOpen && <Cart isOpen={isCartOpen} onClose={handleCloseCart} />}
        </div>
    )
}