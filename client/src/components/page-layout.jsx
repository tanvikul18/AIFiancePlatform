import { cn } from "../lib/utils.js";
import PageHeader from "./page-header";



const PageLayout = ({ children, className,
  title,
  subtitle,
  rightAction,
  showHeader = true,
  addMarginTop = false,
  renderPageHeader,
 }) => {
  return (
    <div>
      {showHeader && (
        <PageHeader 
          title={title} 
          subtitle={subtitle} 
          rightAction={rightAction} 
          renderPageHeader={renderPageHeader}
        />
      )}
    <div className={cn("w-full max-w-[var(--max-width)] mx-auto pt-8",
      addMarginTop && "-mt-20",
      className)}>
      {children}
    </div>
    </div>
  );
};

export default PageLayout;