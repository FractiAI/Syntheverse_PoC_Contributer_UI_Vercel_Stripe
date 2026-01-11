import { OnboardingNavigator } from '@/components/OnboardingNavigator';
import { HeroPanel } from '@/components/HeroPanel';
import '../academy.css';

export default function OnboardingPage() {
  return (
    <div className="academy-bg">
      <OnboardingNavigator />
      <HeroPanel pageContext="academy" pillarContext="contributor" userEmail="" />
    </div>
  );
}
