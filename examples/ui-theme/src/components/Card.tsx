import React from 'react';

interface CardProps {
  title: string;
  content: string;
}

const Card: React.FC<CardProps> = ({ title, content }) => {
  return (
    <div className="rounded-box border border-box-border-light bg-positive p-box-padding-md shadow-box-shadow-top">
      <h3 className="text-text-sm font-text-medium-weight text-text-title mb-box-margin-sm">
        {title}
      </h3>
      <p className="text-text-sm text-text-fourth leading-text">{content}</p>
    </div>
  );
};

export default Card;
