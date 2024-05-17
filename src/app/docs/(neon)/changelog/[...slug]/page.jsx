/* eslint-disable react/prop-types */
import { notFound, redirect } from 'next/navigation';

import Hero from 'components/pages/changelog/hero';
import Container from 'components/shared/container';
import Content from 'components/shared/content';
import Link from 'components/shared/link';
import {
  CHANGELOG_BASE_PATH,
  CHANGELOG_SLUG_REGEX,
  VERCEL_URL,
  MAX_TITLE_LENGTH,
} from 'constants/docs';
import { DEFAULT_IMAGE_PATH } from 'constants/seo-data';
import { getAllChangelogPosts, getPostBySlug, CHANGELOG_DIR_PATH } from 'utils/api-docs';
import getChangelogDateFromSlug from 'utils/get-changelog-date-from-slug';
import getExcerpt from 'utils/get-excerpt';
import getMetadata from 'utils/get-metadata';

export async function generateStaticParams() {
  const changelogPosts = await getAllChangelogPosts();

  return changelogPosts.map(({ slug }) => {
    const slugsArray = slug.split('/');

    return {
      slug: slugsArray,
    };
  });
}

export async function generateMetadata({ params }) {
  const { slug } = params;

  let label = '';
  let description = '';
  let socialPreviewTitle = '';
  const currentSlug = slug.join('/');
  const isChangelogPage = CHANGELOG_SLUG_REGEX.test(currentSlug);
  label = 'Changelog';
  description = `The latest product updates from Neon`;

  if (isChangelogPage) {
    if (!getPostBySlug(currentSlug, CHANGELOG_DIR_PATH)) return notFound();
    const { label: date } = getChangelogDateFromSlug(currentSlug);
    const { content } = getPostBySlug(currentSlug, CHANGELOG_DIR_PATH);
    label = `Changelog ${date}`;
    socialPreviewTitle = `Changelog - ${date}`;
    description = getExcerpt(content, 160);
  }

  const encodedLabel = Buffer.from(socialPreviewTitle ?? label).toString('base64');

  return getMetadata({
    title: `${label} - Neon`,
    description,
    pathname: `${CHANGELOG_BASE_PATH}${currentSlug}`,
    imagePath:
      label.length < MAX_TITLE_LENGTH
        ? `${VERCEL_URL}/docs/og?title=${encodedLabel}`
        : DEFAULT_IMAGE_PATH,
    type: 'article',
  });
}

const ChangelogPost = async ({ currentSlug }) => {
  if (
    currentSlug === 'storage-and-compute' ||
    currentSlug === 'console' ||
    currentSlug === 'compute' ||
    currentSlug === 'drivers' ||
    currentSlug === 'plans' ||
    currentSlug === 'docs'
  )
    redirect('/docs/changelog');

  if (!getPostBySlug(currentSlug, CHANGELOG_DIR_PATH)) return notFound();

  const { datetime, label } = getChangelogDateFromSlug(currentSlug);

  const { content } = getPostBySlug(currentSlug, CHANGELOG_DIR_PATH);

  const isChangelogPage = CHANGELOG_SLUG_REGEX.test(currentSlug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Changelog ${label}`,
    datePublished: datetime,
    author: {
      '@type': 'Organization',
      name: 'Neon',
    },
  };

  return (
    <>
      {isChangelogPage && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="col-span-6 -mr-12 ml-[-33px] flex flex-col 2xl:-ml-4 xl:col-span-9 xl:ml-10 xl:mr-0 xl:max-w-[750px] lg:ml-0 lg:max-w-none lg:pt-0 md:mx-auto md:pb-[70px] sm:pb-8">
        <Hero
          className="flex justify-center lg:pt-16 md:py-10 sm:py-7"
          date={label}
          withContainer
        />
        <div className="flex grow pb-28 lg:pb-20 md:pb-16">
          <Container size="xs" className="relative flex w-full pb-10">
            <article className="relative flex w-full max-w-full flex-col items-start">
              <h2>
                <time
                  className="mt-3 whitespace-nowrap text-gray-new-20 dark:text-gray-new-70"
                  dateTime={datetime}
                >
                  {label}
                </time>
              </h2>
              <Content className="mt-8 w-full max-w-full prose-h3:text-xl" content={content} />
              <Link
                className="mt-10 font-semibold lg:mt-8"
                to={CHANGELOG_BASE_PATH}
                size="sm"
                theme="black-primary-1"
              >
                Back to all changelog posts
              </Link>
            </article>
          </Container>
        </div>
      </div>
    </>
  );
};

const ChangelogPostPage = async ({ params }) => {
  const currentSlug = params?.slug.join('/');

  return <ChangelogPost currentSlug={currentSlug} />;
};

export default ChangelogPostPage;
