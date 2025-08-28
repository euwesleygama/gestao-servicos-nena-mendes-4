import { useIsMobile } from "@/hooks/use-mobile";
import CriarServicoDesktop from "./CriarServicoDesktop";
import CriarServicoMobile from "./CriarServicoMobile";

export default function CriarServico() {
  const isMobile = useIsMobile();
  
  return isMobile ? <CriarServicoMobile /> : <CriarServicoDesktop />;
}