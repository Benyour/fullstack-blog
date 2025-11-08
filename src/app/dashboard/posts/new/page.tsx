import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/dashboard/post-editor";

export const metadata = {
  title: "新建文章",
};

export default async function NewPostPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">新建文章</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          支持 Markdown / MDX，可在正文中插入代码块、提示、引用等组件。
        </p>
      </header>

      <PostEditor
        mode="create"
        availableTags={tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
        }))}
      />
    </div>
  );
}

