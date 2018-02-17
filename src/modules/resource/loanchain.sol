pragma solidity ^0.4.11;

contract Applicant{

  struct  ApplicantAddress  {
        string  street1;
        string  street2;
        string  city;
        string  zip;
        string  state;
        string  country;
    }

    struct Application {
          string lenderName;
          address lenderAddress;
          bool active;
          uint appliedDate;
      }

     string  applicantName;
     string  applicantSex;
     string  applicantDOB;
     ApplicantAddress physicalAddress;
     int ssn;
     int applicantIncome;
     address signedBy;
     mapping (address => Application) public applicationDetails;
     event ApplicationAcknowledged(address from);
     event PersonalInfoRead(address from);
     address[] public myApplications;

     modifier lenderCallOnly(){
       if(!applicationDetails[msg.sender].active){
         revert();
       }else{
         _;
       }
     }

     function Applicant(string _applicantName,
                         string _applicantSex,
                         string _applicantDOB,
                         string _street1,
                         string _street2,
                         string _city,
                         string _zip,
                         string _state,
                         string _country,
                         int _ssn,
                         int _applicantIncome) public{

        applicantName =  _applicantName;
        applicantSex = _applicantSex;
        applicantDOB = _applicantDOB;
        physicalAddress = ApplicantAddress(_street1, _street2, _city, _zip,_state,_country);
        ssn = _ssn;
        applicantIncome = _applicantIncome;
        signedBy = msg.sender;
     }

     function findBySSN(int _ssn) public constant returns (bool){
       if(ssn == _ssn){
         return true;
       }
       return false;
     }

     function ackApplication(string name,address lenderAddress) public{
       applicationDetails[msg.sender] = Application(name,lenderAddress,true,now);
       ApplicationAcknowledged(msg.sender);
       myApplications.push(msg.sender);
     }

     function getApplicantDetails() public constant returns(string,string,string,int,int,address){
       return (applicantName,applicantSex,applicantDOB,ssn,applicantIncome,signedBy);
     }

     function getApplicantAddress() public  constant returns(string,string,string,string,string,string){
       return(physicalAddress.street1,physicalAddress.street2,physicalAddress.city,physicalAddress.zip,physicalAddress.state,physicalAddress.country);
     }
}

contract LoanProgram {

  event ApplicationCreated(address contractAddress);
  string public name;
  function LoanProgram(string _name) public {

    name = _name;
  }

  function apply(address applicant,string loanType, int loanAmount,int loanPeriodInYears) public {
    address newContract = new Loan(name,applicant,loanType,loanAmount,loanPeriodInYears);
    ApplicationCreated(newContract);
  }
}

contract Loan {

   address public applicantContractAddress;
   string public loanType;
   int public loanAmount;
   address public loanProgramAddress = msg.sender;
   bool public received;
   bool public goodCredit;
   bool public approved;
   event UpdatingCreditStatusFor(int ssn);
   event DisclosuresUpdated(int _estimatedIntrestRate,int _estimatedEMI);
   event LoanAmountTxfed(uint _amount);
   int ssn;
   int applicantIncome;
   address signedBy;
   int public estimatedIntrestRate;
   int public estimatedEMI;
   int public loanPeriodInYears;

   function Loan(string _programName,address _applicantContract,string _loanType,int _loanAmount,int _loanPeriodInYears) public {
     Applicant applicant =  Applicant(_applicantContract);
     applicant.ackApplication(_programName,loanProgramAddress);
     (,,,ssn,applicantIncome,signedBy) = applicant.getApplicantDetails();
     applicantContractAddress = _applicantContract;
     loanType = _loanType;
     loanAmount = _loanAmount;
     received = true;
     loanPeriodInYears = _loanPeriodInYears;
   }

   function updateCreditStatus(bool _creditStatus) public {
      UpdatingCreditStatusFor(ssn);
      goodCredit = _creditStatus;
   }

   function addDisclosure(int _estimatedIntrestRate,int _estimatedEMI) public {
      estimatedIntrestRate = _estimatedIntrestRate;
      estimatedEMI = _estimatedEMI;
      DisclosuresUpdated(_estimatedIntrestRate,_estimatedEMI);

   }

  function approveLoan() public payable {
    if(goodCredit){
      signedBy.transfer(msg.value);
      approved = true;
      LoanAmountTxfed(msg.value);
    }else{
      revert();
    }
  }
}