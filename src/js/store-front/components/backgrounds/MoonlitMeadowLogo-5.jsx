import { useTheme } from "../../hooks/useTheme";

export default function MoonlitMeadowLogo() {
  const { theme } = useTheme();
  return (
    <>
      <h1 className="xpo_text-3xl xpo_font-bold xpo_bg-gradient-to-r xpo_from-blue-400 xpo_to-purple-500 xpo_bg-clip-text xpo_text-transparent">
        MoonlitMeadow
      </h1>
      <div className="xpo_text-yellow-400 xpo_text-xl">™</div>
    </>
  )
}