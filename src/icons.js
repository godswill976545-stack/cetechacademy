import {
  createIcons,
  Menu,
  ChevronRight,
  ArrowRight,
  Code2,
  CheckCircle,
  Layout,
  Terminal,
  Palette,
  TrendingUp,
  Database,
  Bot,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Rocket,
  Heart,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  UserPlus,
  X
} from 'lucide';

export const initIcons = () => {
  createIcons({
    icons: {
      Menu,
      ChevronRight,
      ArrowRight,
      Code2,
      CheckCircle,
      Layout,
      Terminal,
      Palette,
      TrendingUp,
      Database,
      Bot,
      Check,
      Sparkles,
      ChevronDown,
      ChevronUp,
      Megaphone,
      Rocket,
      Heart,
      User,
      Mail,
      Lock,
      Eye,
      EyeOff,
      LogIn,
      Loader2,
      UserPlus,
      X
    }
  });
};

// Make it available globally if needed for dynamic updates
window.initIcons = initIcons;
