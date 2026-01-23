import { useTheme } from "../../hooks/useTheme";

export default function MoonlitMeadowLogo() {
  const { theme } = useTheme();
  return (
    <>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        MoonlitMeadow
      </h1>
      <div className="text-yellow-400 text-xl">™</div>
    </>
  )
}