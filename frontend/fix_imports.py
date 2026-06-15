import sys

with open("frontend/app/marketplace/page.tsx", "r") as f:
    content = f.read()

content = content.replace('import { useToast } from "@/components/Toast";', 
                          'import { useToast } from "@/components/Toast";\nimport { Leaf, Bot, ShieldCheck, Recycle, Package, Coins, Truck } from \'lucide-react\';')

with open("frontend/app/marketplace/page.tsx", "w") as f:
    f.write(content)
