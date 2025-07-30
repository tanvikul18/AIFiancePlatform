import { PROTECTED_ROUTES } from "../../routes/common/routePath.js"
import { GalleryVerticalEnd } from "lucide-react"
import { Link } from "react-router-dom"

const Logo = (props) => {
  return (
    <Link to={props.url || PROTECTED_ROUTES.OVERVIEW} className="flex items-center gap-2">
    <div className="bg-green-500 text-white h-6.5 w-6.5 rounded flex items-center justify-center">
    <GalleryVerticalEnd className="size-4" />
    </div>
    <span className="font-semibold text-lg">Finora</span>
  </Link>
  )
}

export default Logo;