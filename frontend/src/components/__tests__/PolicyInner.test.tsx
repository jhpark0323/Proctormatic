import React, { Dispatch, SetStateAction } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PolicyInner from '@/components/PolicyInner';

describe('PolicyInner 컴포넌트 테스트', () => {
  // 상태 변수 및 setter 함수에 대한 타입 정의
  let allChecked: boolean, setAllChecked: Dispatch<SetStateAction<boolean>>;
  let requiredChecks: boolean[], setRequiredChecks: Dispatch<SetStateAction<boolean[]>>;
  let marketingChecked: boolean, setMarketingChecked: Dispatch<SetStateAction<boolean>>;

  // 각 테스트 전에 상태 초기화
  beforeEach(() => {
    allChecked = false;
    requiredChecks = [false, false, false, false];
    marketingChecked = false;
  });

  // 전체 동의 체크박스 처리 함수
  const handleAllCheck = (checked: boolean) => {
    act(() => {
      setAllChecked(checked);
      setRequiredChecks([checked, checked, checked, checked]);
      setMarketingChecked(checked);
    });
  };

  // 필수 항목 체크박스 개별 처리 함수
  const handleRequiredCheck = (index: number, checked: boolean) => {
    act(() => {
      const newRequiredChecks = [...requiredChecks];
      newRequiredChecks[index] = checked;
      setRequiredChecks(newRequiredChecks);

      if (newRequiredChecks.every((check) => check) && marketingChecked) {
        setAllChecked(true);
      } else {
        setAllChecked(false);
      }
    });
  };

  // 마케팅 동의 체크박스 처리 함수
  const handleMarketingCheck = (checked: boolean) => {
    act(() => {
      setMarketingChecked(checked);

      if (requiredChecks.every((check) => check) && checked) {
        setAllChecked(true);
      } else {
        setAllChecked(false);
      }
    });
  };

  // PolicyInner를 렌더링하는 함수
  const renderPolicyInner = () => {
    const Component: React.FC = () => {
      [allChecked, setAllChecked] = React.useState<boolean>(false);
      [requiredChecks, setRequiredChecks] = React.useState<boolean[]>([false, false, false, false]);
      [marketingChecked, setMarketingChecked] = React.useState<boolean>(false);

      return (
        <PolicyInner
          onAllCheck={handleAllCheck}
          onRequiredCheck={handleRequiredCheck}
          onMarketingCheck={handleMarketingCheck}
          allChecked={allChecked}
          requiredChecks={requiredChecks}
          marketingChecked={marketingChecked}
        />
      );
    };

    render(<Component />);
  };

  it('전체 동의 체크박스가 정상적으로 작동하는지 확인', () => {
    renderPolicyInner();
    // allcheckbox를 클릭한다.
    const allCheckbox = screen.getByTestId('all-check');
    act(() => {
      fireEvent.click(allCheckbox);
    });
    // allchecked 상태는 true여야 하고 다른 항목들도 모두 true 값이 되어야 한다.
    expect(allChecked).toBe(true);
    expect(requiredChecks).toEqual([true, true, true, true]);
    expect(marketingChecked).toBe(true);
  });

  it('필수 동의 항목들의 개별 체크가 정상적으로 작동하는지 확인', () => {
    renderPolicyInner();
    // 각각의 check 항목들을 다 가져온다.
    const ageCheck = screen.getByTestId('age-check');
    const termsCheck = screen.getByTestId('terms-check');
    const locationCheck = screen.getByTestId('location-check');
    const privacyCheck = screen.getByTestId('privacy-check');
    
    // 나이에 대한 동의 항목을 클릭하면 true 상태가 되는지 확인
    act(() => {
      fireEvent.click(ageCheck);
    });
    expect(requiredChecks[0]).toBe(true);
    // 이용약관에 대한 동의 항목을 클릭하면 true 상태가 되는지 확인
    act(() => {
      fireEvent.click(termsCheck);
    });
    expect(requiredChecks[1]).toBe(true);
    // 위치 정보 서비스 이용약관 동의 항목을 클릭하면 true 상태가 되는지 확인
    act(() => {
      fireEvent.click(locationCheck);
    });
    expect(requiredChecks[2]).toBe(true);
     // 개인정보 처리 방침에 동의 항목을 클릭하면 true 상태가 되는지 확인
    act(() => {
      fireEvent.click(privacyCheck);
    });
    expect(requiredChecks[3]).toBe(true);
    // 마케팅 활용은 체크를 하지 않았기 때문에 전체 선택에 false가 되어 있는지 확인
    expect(allChecked).toBe(false);
  });

  it('마케팅 동의 항목 개별 체크가 정상적으로 작동하는지 확인', () => {
    renderPolicyInner();
    // 마케팅 동의를 체크하는 체크박스를 클릭
    const marketingCheck = screen.getByTestId('marketing-check');
    act(() => {
      fireEvent.click(marketingCheck);
    });
    // 마케팅 체크가 되어있는지와, 마케팅만 체크했으니 모두 체크는 false여야 함
    expect(marketingChecked).toBe(true);
    expect(allChecked).toBe(false);
  });

  it('모든 항목 개별 체크 후 전체 동의 상태가 잘 반영이 되는지 확인', () => {
    renderPolicyInner();
    // 모든 체크 박스를 배열에 할당하여
    const checkboxes = [
      screen.getByTestId('age-check'),
      screen.getByTestId('terms-check'),
      screen.getByTestId('location-check'),
      screen.getByTestId('privacy-check'),
      screen.getByTestId('marketing-check'),
    ];
    // 하나씩 꺼내어서 눌러본다.

    act(() => {
      checkboxes.forEach((checkbox) => {
        fireEvent.click(checkbox);
      });
    });
     // 그럼 모두 체크 상태가 true, 각각의 상태도 true, 마케팅 활용 동의 역시 true여야 한다.
    expect(allChecked).toBe(true);
    expect(requiredChecks).toEqual([true, true, true, true]);
    expect(marketingChecked).toBe(true);
  });

  it('전체 동의를 하고 다시 전체 해제를 하면 상태가 잘 반영이 되는지 확인', () => {
    renderPolicyInner();
    // 전체 동의 체크 박스를 불러와서 두번 눌러본다.
    const allCheckbox = screen.getByTestId('all-check');

    act(() => {
      fireEvent.click(allCheckbox);
      fireEvent.click(allCheckbox);
    });
    // 두 번 눌렀으니 모든 값이 false여야 한다.
    expect(allChecked).toBe(false);
    expect(requiredChecks).toEqual([false, false, false, false]);
    expect(marketingChecked).toBe(false);
  });
});
