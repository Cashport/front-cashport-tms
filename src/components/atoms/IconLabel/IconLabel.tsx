import React, { ReactNode } from 'react';
import './iconlabel.scss';

interface IconLabelProps {
  icon: ReactNode;
  text: string;
}

export const IconLabel: React.FC<IconLabelProps> = ({ icon, text }) => {
  return (
    <div className="icon-label__container ">
      <span className="icon-label ">{icon}</span>
      <span className="text-label_tab">{text}</span>
    </div>
  );
};