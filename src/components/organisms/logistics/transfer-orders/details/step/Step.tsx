import { Typography } from 'antd';
import styles from './step.module.scss';
import { FC } from 'react';
import { IStep } from '@/types/transferRequest/ITransferRequest';
import dayjs from 'dayjs';

const Text = Typography;

interface IStepProps {
  steps: IStep[];
}

export const Step: FC<IStepProps> = ({ steps }) => {
  const customSteps = [
    {
      id: 1,
      number: 1,
      title: 'Booking',
      date: '',
      name: '',
      isFinished: false,
      isCurrentDot: false,
    },
    {
      id: 2,
      number: 2,
      title: 'Pricing',
      date: '',
      name: '',
      isFinished: false,
      isCurrentDot: false,
    },
    {
      id: 3,
      number: 3,
      title: 'En curso',
      date: '',
      name: '',
      isFinished: false,
      isCurrentDot: false,
    },
    {
      id: 4,
      number: 4,
      title: 'Legalización',
      date: '',
      name: '',
      isFinished: false,
      isCurrentDot: false,
    },
    {
      id: 5,
      number: 5,
      title: 'Facturado',
      date: '',
      name: '',
      isFinished: false,
      isCurrentDot: false,
    },
  ]

  const stepsMapped = customSteps.map((item) => {
    const findStepFinished = steps.find((step) => step.order_nro === item.id);
    
    if (findStepFinished) {
      return {
        ...item,
        date: dayjs(findStepFinished.consolidation_date).format('DD/MM/YY - HH:mm [h]'),
        name: findStepFinished.uuid_user,
        isFinished: true,
        isCurrentDot: false,
      }
    }
    
    return {
      ...item,
      isCurrentDot: item.id === (steps.length + 1),
    }
  })

  return (
    <div className={styles.mainSteps}>
      {stepsMapped.map((item, index) => (
        <div
          key={`step-${index}`}
          className={`${styles.step} ${index + 1 === stepsMapped.length && styles.lastStep}`}>
          <div className={styles.dotContainer}>
            <div className={`${styles.dot} ${item.isCurrentDot && steps.length !== customSteps.length && styles.currentDot} ${!item.isFinished && !item.isCurrentDot && styles.nextDot}`}>
              <Text className={`${styles.dotText} ${((item.isCurrentDot && steps.length !== customSteps.length) || !item.isFinished) && styles.currentDotText}`}>{item.number}</Text>
            </div>
            {index + 1 === stepsMapped.length || <div className={`${styles.dotLine} ${item.id === steps.length && steps.length !== customSteps.length && styles.currentDotLine} ${index + 1 > steps.length && styles.nextDotLine}`} />}
          </div>
          <div>
            <Text className={styles.title}>{item.title}</Text>
            <Text className={styles.subtitle}>{item.date}</Text>
            <Text className={styles.subtitle}>{item.name}</Text>
          </div>
        </div>
      ))}
    </div>
  )
}